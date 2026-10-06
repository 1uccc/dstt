const { db } = require('../config/firebase');

// [Tạo Booking mới] (Khách hàng)
exports.createBooking = async (req, res) => {
  try {
    const { customerName, phone, fieldId, date, time, amount, paymentMethod, reference } = req.body;
    
    const fieldRef = db.collection('fields').doc(fieldId);
    const fieldDoc = await fieldRef.get();
    if (!fieldDoc.exists) return res.status(404).json({ message: 'Sân không tồn tại' });
    const fieldData = fieldDoc.data();

    // Tạo mã đơn ngẫu nhiên SPB-XXXX
    const bookingCode = `SPB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      bookingCode, customerName, phone, 
      fieldId: fieldId, fieldName: fieldData.name,
      date, time, amount, paymentMethod, reference,
      userId: req.user ? req.user.uid : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const bookingRef = await db.collection('bookings').add(newBooking);

    // Tăng số lượng booking cho sân
    await fieldRef.update({
      bookings: (fieldData.bookings || 0) + 1
    });

    res.status(201).json({ message: 'Đặt sân thành công', booking: { id: bookingRef.id, ...newBooking } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
  }
};

// [Lấy danh sách Booking] (Cho Admin/Owner)
exports.getAllBookings = async (req, res) => {
  try {
    let query = db.collection('bookings');
    
    // Nếu là chủ sân, chỉ lấy đơn của sân họ
    if (req.user && req.user.role === 'owner') {
      const ownerFieldsSnapshot = await db.collection('fields').where('owner', '==', req.user.uid).get();
      const ownerFieldIds = ownerFieldsSnapshot.docs.map(doc => doc.id);
      
      if (ownerFieldIds.length > 0) {
        query = query.where('fieldId', 'in', ownerFieldIds);
      } else {
         return res.json([]); // Không có sân nào, trả về rỗng
      }
    } else if (req.user && req.user.role === 'customer') {
      // Nếu là khách hàng, lấy danh sách sân đã đặt
      query = query.where('userId', '==', req.user.uid);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sắp xếp giảm dần theo thời gian tạo
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Cập nhật trạng thái Booking]
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const bookingRef = db.collection('bookings').doc(bookingId);
    await bookingRef.update({ status, updatedAt: new Date().toISOString() });
    
    res.json({ message: 'Cập nhật trạng thái thành công', bookingId, status });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};
