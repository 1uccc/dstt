/**
 * [REPOSITORY PATTERN] - FieldRepository
 * Tách biệt tầng truy xuất dữ liệu Sân thể thao & Đánh giá (Fields & Reviews)
 */

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

class FieldRepository {
  /**
   * Lấy danh sách sân theo bộ lọc (môn thể thao, trạng thái active)
   */
  async getAll({ sport, active, limit = 100 }) {
    let query = db.collection('fields');

    if (sport) {
      query = query.where('sport', '==', sport);
    }
    if (active !== undefined && active !== null) {
      query = query.where('active', '==', active === true || active === 'true');
    }

    query = query.limit(Number(limit) || 100);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Lấy chi tiết sân theo ID
   */
  async getById(fieldId) {
    const doc = await db.collection('fields').doc(fieldId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Thêm sân mới
   */
  async create(fieldData) {
    const docRef = await db.collection('fields').add(fieldData);
    return { id: docRef.id, ...fieldData };
  }

  /**
   * Cập nhật thông tin sân
   */
  async update(fieldId, updates) {
    const fieldRef = db.collection('fields').doc(fieldId);
    await fieldRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { id: fieldId, ...updates };
  }

  /**
   * Xóa sân và toàn bộ dữ liệu liên quan (bookings, reviews) trong Batch
   */
  async delete(fieldId) {
    const fieldRef = db.collection('fields').doc(fieldId);

    // Lấy bookings và reviews liên quan để xóa cascade
    const [bookingsSnap, reviewsSnap] = await Promise.all([
      db.collection('bookings').where('fieldId', '==', fieldId).get(),
      db.collection('reviews').where('fieldId', '==', fieldId).get(),
    ]);

    const batch = db.batch();
    batch.delete(fieldRef);

    bookingsSnap.forEach((doc) => batch.delete(doc.ref));
    reviewsSnap.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    return true;
  }

  /**
   * Lấy danh sách đánh giá của sân
   */
  async getReviews(fieldId) {
    const snapshot = await db.collection('reviews')
      .where('fieldId', '==', fieldId)
      .get();

    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    reviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return reviews;
  }

  /**
   * [TỐI ƯU HÓA HIỆU NĂNG]: Thêm đánh giá mới và tính rating trung bình
   * bằng công thức lũy kế (Incremental Average) thay vì quét toàn bộ bảng reviews
   */
  async addReview(fieldId, reviewData) {
    const fieldRef = db.collection('fields').doc(fieldId);
    const fieldDoc = await fieldRef.get();

    if (!fieldDoc.exists) {
      throw new Error('FIELD_NOT_FOUND');
    }

    const field = fieldDoc.data();
    const currentRating = Number(field.rating) || 5.0;
    const currentReviewCount = Number(field.reviews) || 0;
    const newRatingVal = Number(reviewData.rating);

    // Công thức tính trung bình lũy kế:
    // newAverage = (currentAverage * oldCount + newRating) / (oldCount + 1)
    const newAverageRating = Math.round(
      ((currentRating * currentReviewCount + newRatingVal) / (currentReviewCount + 1)) * 10
    ) / 10;

    const newReview = {
      fieldId,
      userId: reviewData.userId,
      customerName: reviewData.customerName || 'Khách hàng',
      rating: newRatingVal,
      comment: reviewData.comment || '',
      createdAt: new Date().toISOString(),
    };

    const reviewRef = await db.collection('reviews').add(newReview);

    // Cập nhật rating và số lượt review trực tiếp trên Field Document
    await fieldRef.update({
      rating: newAverageRating,
      reviews: FieldValue.increment(1),
    });

    return { id: reviewRef.id, ...newReview };
  }

  /**
   * Kiểm tra điều kiện user có thể đánh giá (đã từng đá và hoàn thành trước thời điểm hiện tại)
   */
  async canUserReview(fieldId, userId) {
    const snapshot = await db.collection('bookings')
      .where('fieldId', '==', fieldId)
      .where('userId', '==', userId)
      .where('status', 'in', ['paid', 'confirmed', 'completed'])
      .get();

    if (snapshot.empty) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const bDate = data.date;

      if (bDate < todayStr) {
        return true;
      } else if (bDate === todayStr) {
        const times = (data.time || '').split(',').map((t) => t.trim());
        const lastTime = times[times.length - 1];
        if (lastTime && lastTime.includes('-')) {
          const endTimeStr = lastTime.split('-')[1].trim();
          const [hours, mins] = endTimeStr.split(':').map(Number);
          if (currentMinutes >= (hours * 60 + mins)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Chủ sân phản hồi đánh giá
   */
  async replyReview(reviewId, replyText) {
    const reviewRef = db.collection('reviews').doc(reviewId);
    await reviewRef.update({
      ownerReply: replyText,
      repliedAt: new Date().toISOString(),
    });
    return { reviewId, reply: replyText };
  }
}

module.exports = new FieldRepository();
