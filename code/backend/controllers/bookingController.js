const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Tạo mã booking duy nhất dạng SPB-YYYYMMDD-XXXX (timestamp + random)
function generateBookingCode() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  const suffix = now.getMilliseconds().toString(36).toUpperCase();
  return `SPB-${dateStr}-${rand}${suffix}`;
}

// Các trạng thái hợp lệ khi chuyển đổi
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

// [Tạo Booking mới] (Khách hàng) — Sử dụng Firestore Transaction để tránh double booking
exports.createBooking = async (req, res) => {
  try {
    const { customerName, phone, fieldId, date, time, amount, paymentMethod, reference } = req.body;

    // Kiểm tra phân quyền: Chủ sân không được phép đặt sân
    if (req.user && req.user.role === 'owner') {
      return res.status(403).json({ message: 'Tài khoản Chủ sân không thể thực hiện đặt sân. Vui lòng sử dụng tài khoản Khách hàng.' });
    }
    if (req.user && req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Chỉ tài khoản Khách hàng mới có thể đặt sân.' });
    }

    // Validate input cơ bản
    if (!fieldId || !date || !time) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (fieldId, date, time).' });
    }

    const fieldRef = db.collection('fields').doc(fieldId);

    // Chạy transaction để đảm bảo không có double booking
    const result = await db.runTransaction(async (transaction) => {
      const fieldDoc = await transaction.get(fieldRef);
      if (!fieldDoc.exists) {
        throw new Error('FIELD_NOT_FOUND');
      }
      const fieldData = fieldDoc.data();

      // Kiểm tra slot đã có người đặt chưa
      const existingBookingsSnapshot = await db.collection('bookings')
        .where('fieldId', '==', fieldId)
        .where('date', '==', date)
        .get();

      const requestedSlots = time.split(',').map(s => s.trim());
      for (const doc of existingBookingsSnapshot.docs) {
        const data = doc.data();
        if (['pending', 'confirmed', 'paid'].includes(data.status)) {
          const bookedSlots = data.time.split(',').map(s => s.trim());
          const overlap = requestedSlots.some(slot => bookedSlots.includes(slot));
          if (overlap) {
            throw new Error('SLOT_ALREADY_BOOKED');
          }
        }
      }

      const bookingCode = generateBookingCode();
      const newBooking = {
        bookingCode,
        customerName: customerName || 'Khách hàng',
        phone: phone || '',
        fieldId,
        fieldName: fieldData.name,
        date,
        time,
        amount: Number(amount) || 0,
        paymentMethod: paymentMethod || '',
        reference: reference || '',
        userId: req.user ? req.user.uid : null,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const bookingRef = db.collection('bookings').doc();
      transaction.set(bookingRef, newBooking);

      // Tăng số lượng booking cho sân
      transaction.update(fieldRef, {
        bookings: FieldValue.increment(1)
      });

      return { id: bookingRef.id, ...newBooking };
    });

    res.status(201).json({ message: 'Đặt sân thành công', booking: result });
  } catch (error) {
    if (error.message === 'FIELD_NOT_FOUND') {
      return res.status(404).json({ message: 'Sân không tồn tại' });
    }
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return res.status(400).json({ message: 'Khung giờ này đã được đặt hoặc đang chờ xác nhận. Vui lòng chọn khung giờ khác.' });
    }
    res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
  }
};

// [Lấy danh sách Booking] (Cho Admin/Owner)
// Hỗ trợ owner có nhiều sân bằng cách chia nhỏ query nếu >30 field IDs
exports.getAllBookings = async (req, res) => {
  try {
    // Nếu là chủ sân, chỉ lấy đơn của sân họ
    if (req.user && req.user.role === 'owner') {
      const ownerFieldsSnapshot = await db.collection('fields').where('owner', '==', req.user.uid).get();
      const ownerFieldIds = ownerFieldsSnapshot.docs.map(doc => doc.id);

      if (ownerFieldIds.length === 0) {
        return res.json([]);
      }

      // Firestore 'in' hỗ trợ tối đa 30 giá trị, chia nhỏ nếu cần
      const BATCH_SIZE = 30;
      let allBookings = [];
      for (let i = 0; i < ownerFieldIds.length; i += BATCH_SIZE) {
        const batch = ownerFieldIds.slice(i, i + BATCH_SIZE);
        const snapshot = await db.collection('bookings').where('fieldId', 'in', batch).get();
        allBookings = allBookings.concat(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(allBookings);

    } else if (req.user && req.user.role === 'customer') {
      const snapshot = await db.collection('bookings').where('userId', '==', req.user.uid).get();
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(bookings);
    }

    // Admin: lấy tất cả
    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Cập nhật trạng thái Booking] — Có validate booking tồn tại + status transition
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái mới.' });
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    }

    const currentStatus = bookingDoc.data().status;
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ '${currentStatus}' sang '${status}'. Trạng thái hợp lệ: ${allowedNextStatuses.join(', ') || 'không có'}.`
      });
    }

    await bookingRef.update({ status, updatedAt: new Date().toISOString() });

    res.json({ message: 'Cập nhật trạng thái thành công', bookingId, status });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};
