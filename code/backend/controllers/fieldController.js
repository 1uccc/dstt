/**
 * [CONTROLLER LAYER] - fieldController
 * Tiếp nhận HTTP Request liên quan đến Sân & Đánh giá,
 * kết hợp cùng FieldFactory (Factory Pattern) để tạo đối tượng chuẩn hóa
 * và ủy quyền cho FieldRepository / BookingRepository (Repository Pattern).
 */

const fieldRepository = require('../repositories/FieldRepository');
const bookingRepository = require('../repositories/BookingRepository');
const FieldFactory = require('../factories/FieldFactory');

// [Lấy danh sách sân]
exports.getAllFields = async (req, res) => {
  try {
    const { sport, active, limit } = req.query;
    const fields = await fieldRepository.getAll({ sport, active, limit });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
  }
};

// [Lấy chi tiết sân]
exports.getFieldById = async (req, res) => {
  try {
    const field = await fieldRepository.getById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Không tìm thấy sân' });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Thêm sân mới] - Sử dụng FieldFactory (Factory Pattern)
exports.createField = async (req, res) => {
  try {
    const fieldPayload = FieldFactory.createField(req.body, req.user.uid);
    const createdField = await fieldRepository.create(fieldPayload);
    res.status(201).json({ message: 'Thêm sân thành công', field: createdField });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sân', error: error.message });
  }
};

// [Cập nhật sân]
exports.updateField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const field = await fieldRepository.getById(fieldId);

    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    if (req.user.role !== 'admin' && field.owner !== req.user.uid) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa sân này' });
    }

    const allowedFields = [
      'name', 'location', 'address', 'sport', 'price', 
      'image', 'images', 'mapUrl', 'ownerName', 'amenities', 
      'schedule', 'active', 'description'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const result = await fieldRepository.update(fieldId, updates);
    res.json({ message: 'Cập nhật thành công', field: result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// [Lấy danh sách các khung giờ đã đặt của một sân] (Tối ưu ngày >= hôm nay)
exports.getFieldBookings = async (req, res) => {
  try {
    const bookings = await bookingRepository.getFieldBookings(req.params.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch đặt', error: error.message });
  }
};

// [Lấy danh sách đánh giá của sân]
exports.getFieldReviews = async (req, res) => {
  try {
    const reviews = await fieldRepository.getReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy đánh giá', error: error.message });
  }
};

// [Thêm đánh giá] (Tối ưu tính rating lũy kế)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, customerName } = req.body;
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5 sao.' });
    }

    const review = await fieldRepository.addReview(req.params.id, {
      userId: req.user.uid,
      customerName,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ message: 'Đánh giá thành công', review });
  } catch (error) {
    if (error.message === 'FIELD_NOT_FOUND') {
      return res.status(404).json({ message: 'Sân không tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi khi thêm đánh giá', error: error.message });
  }
};

// [Kiểm tra user có quyền đánh giá sân không]
exports.canReview = async (req, res) => {
  try {
    const canReview = await fieldRepository.canUserReview(req.params.id, req.user.uid);
    res.json({ canReview });
  } catch (error) {
    res.status(500).json({ canReview: false, error: error.message });
  }
};

// [Xóa sân và dữ liệu liên quan]
exports.deleteField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const field = await fieldRepository.getById(fieldId);

    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    if (req.user.role !== 'admin' && field.owner !== req.user.uid) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa sân này' });
    }

    await fieldRepository.delete(fieldId);
    res.json({ message: 'Đã xóa sân và các dữ liệu liên quan' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
};

// [Phản hồi đánh giá]
exports.replyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { reply } = req.body;

    const field = await fieldRepository.getById(id);
    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    if (req.user.role !== 'admin' && field.owner !== req.user.uid) {
      return res.status(403).json({ message: 'Bạn không có quyền phản hồi đánh giá của sân này' });
    }

    const result = await fieldRepository.replyReview(reviewId, reply);
    res.json({ message: 'Đã phản hồi đánh giá', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
