/**
 * [REPOSITORY PATTERN] - BookingRepository
 * Tách biệt tầng truy xuất dữ liệu Đơn đặt sân (Firestore Database)
 * khỏi tầng Controller, đảm bảo nguyên lý Single Responsibility & Data Access Layer độc lập.
 */

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Tạo mã booking duy nhất dạng SPB-YYYYMMDD-XXXX
function generateBookingCode() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  const suffix = now.getMilliseconds().toString(36).toUpperCase();
  return `SPB-${dateStr}-${rand}${suffix}`;
}

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

class BookingRepository {
  /**
   * Tạo booking mới trong Firestore Transaction để chống double booking (đặt trùng khung giờ)
   */
  async createWithTransaction(bookingData, userUid) {
    const { fieldId, date, time, customerName, phone, amount, paymentMethod, reference, note } = bookingData;
    const fieldRef = db.collection('fields').doc(fieldId);

    return await db.runTransaction(async (transaction) => {
      const fieldDoc = await transaction.get(fieldRef);
      if (!fieldDoc.exists) {
        throw new Error('FIELD_NOT_FOUND');
      }
      const field = fieldDoc.data();

      // Kiểm tra slot đã có người đặt trong ngày đó chưa
      const existingBookingsSnapshot = await db.collection('bookings')
        .where('fieldId', '==', fieldId)
        .where('date', '==', date)
        .get();

      const requestedSlots = time.split(',').map((s) => s.trim());
      for (const doc of existingBookingsSnapshot.docs) {
        const data = doc.data();
        if (['pending', 'confirmed', 'paid'].includes(data.status)) {
          const bookedSlots = data.time.split(',').map((s) => s.trim());
          const overlap = requestedSlots.some((slot) => bookedSlots.includes(slot));
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
        fieldName: field.name,
        date,
        time,
        amount: Number(amount) || 0,
        paymentMethod: paymentMethod || 'Chuyển khoản (VietQR)',
        reference: reference || '',
        note: note || '',
        userId: userUid || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const bookingRef = db.collection('bookings').doc();
      transaction.set(bookingRef, newBooking);

      // Tăng số lượng đặt sân
      transaction.update(fieldRef, {
        bookings: FieldValue.increment(1),
      });

      return { id: bookingRef.id, ...newBooking };
    });
  }

  /**
   * Lấy danh sách booking theo vai trò: Khách hàng
   */
  async getByUserId(userId) {
    const snapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .get();
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return bookings;
  }

  /**
   * Lấy danh sách booking của các sân do Chủ sân sở hữu
   */
  async getByOwnerId(ownerUid) {
    const ownerFieldsSnapshot = await db.collection('fields')
      .where('owner', '==', ownerUid)
      .get();
    const ownerFieldIds = ownerFieldsSnapshot.docs.map((doc) => doc.id);

    if (ownerFieldIds.length === 0) {
      return [];
    }

    // Firestore giới hạn tối đa 30 phần tử trong 'in' query
    const BATCH_SIZE = 30;
    let allBookings = [];
    for (let i = 0; i < ownerFieldIds.length; i += BATCH_SIZE) {
      const batch = ownerFieldIds.slice(i, i + BATCH_SIZE);
      const snapshot = await db.collection('bookings')
        .where('fieldId', 'in', batch)
        .get();
      allBookings = allBookings.concat(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    allBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return allBookings;
  }

  /**
   * Lấy toàn bộ booking (dành cho Admin)
   */
  async getAll() {
    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return bookings;
  }

  /**
   * Lấy thông tin 1 booking theo ID
   */
  async getById(bookingId) {
    const doc = await db.collection('bookings').doc(bookingId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Cập nhật trạng thái booking có kiểm tra quy tắc State Transition
   */
  async updateStatus(bookingId, nextStatus) {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    const currentStatus = bookingDoc.data().status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(nextStatus)) {
      throw new Error(`INVALID_TRANSITION:${currentStatus}->${nextStatus}`);
    }

    await bookingRef.update({
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });

    return { bookingId, status: nextStatus };
  }

  /**
   * [TỐI ƯU HÓA HIỆU NĂNG]: Lấy các khung giờ đã đặt của một sân,
   * chỉ lấy từ ngày hôm nay trở đi (tránh kéo hàng nghìn booking cũ trong quá khứ)
   */
  async getFieldBookings(fieldId) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const snapshot = await db.collection('bookings')
      .where('fieldId', '==', fieldId)
      .where('date', '>=', todayStr)
      .get();

    return snapshot.docs
      .map((doc) => doc.data())
      .filter((b) => ['pending', 'confirmed', 'paid'].includes(b.status))
      .map((b) => ({ date: b.date, time: b.time }));
  }

  /**
   * [TỐI ƯU HÓA HIỆU NĂNG]: Tìm và hủy các đơn pending quá 30 phút
   */
  async cancelExpiredPendingBookings(expiryMinutes = 30) {
    const now = new Date();
    const expiryIso = new Date(now.getTime() - expiryMinutes * 60 * 1000).toISOString();

    const snapshot = await db.collection('bookings')
      .where('status', '==', 'pending')
      .get();

    if (snapshot.empty) return 0;

    const expiredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.createdAt && data.createdAt < expiryIso;
    });

    if (expiredDocs.length === 0) return 0;

    const batch = db.batch();
    expiredDocs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'cancelled',
        updatedAt: now.toISOString(),
        cancelReason: `Hệ thống tự động hủy do quá hạn xác nhận thanh toán (${expiryMinutes} phút)`,
      });
    });

    await batch.commit();
    return expiredDocs.length;
  }
}

module.exports = new BookingRepository();
