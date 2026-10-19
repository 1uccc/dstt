/**
 * [CONTROLLER LAYER] - bookingController
 * Đóng vai trò tiếp nhận HTTP Request, validate tham số,
 * ủy quyền xử lý nghiệp vụ & truy xuất database cho BookingRepository,
 * và chuẩn hóa HTTP Response trả về client.
 */

const bookingRepository = require('../repositories/BookingRepository');

// [Tạo Booking mới] (Khách hàng)
exports.createBooking = async (req, res) => {
  try {
    const { fieldId, date, time } = req.body;

    // Phân quyền
    if (req.user && req.user.role === 'owner') {
      return res.status(403).json({ message: 'Tài khoản Chủ sân không thể thực hiện đặt sân. Vui lòng sử dụng tài khoản Khách hàng.' });
    }
    if (req.user && req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Chỉ tài khoản Khách hàng mới có thể đặt sân.' });
    }

    if (!fieldId || !date || !time) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (fieldId, date, time).' });
    }

    const booking = await bookingRepository.createWithTransaction(req.body, req.user ? req.user.uid : null);
    res.status(201).json({ message: 'Đặt sân thành công', booking });
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

// [Lấy danh sách Booking] (Theo phân quyền: Admin, Owner, Customer)
exports.getAllBookings = async (req, res) => {
  try {
    if (req.user && req.user.role === 'owner') {
      const bookings = await bookingRepository.getByOwnerId(req.user.uid);
      return res.json(bookings);
    } else if (req.user && req.user.role === 'customer') {
      const bookings = await bookingRepository.getByUserId(req.user.uid);
      return res.json(bookings);
    }

    // Admin
    const bookings = await bookingRepository.getAll();
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

    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái mới.' });
    }

    const existing = await bookingRepository.getById(bookingId);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    }

    // Nếu là Customer, chỉ cho phép tự hủy đơn nếu đơn đang là 'pending' và thuộc về chính họ
    if (req.user.role === 'customer') {
      if (existing.userId !== req.user.uid) {
        return res.status(403).json({ message: 'Bạn không có quyền thao tác trên đơn này.' });
      }
      if (status !== 'cancelled' || existing.status !== 'pending') {
        return res.status(400).json({ message: 'Khách hàng chỉ có thể tự hủy đơn khi đơn đang ở trạng thái Chờ xác nhận.' });
      }
    }

    const result = await bookingRepository.updateStatus(bookingId, status);
    res.json({ message: 'Cập nhật trạng thái thành công', ...result });
  } catch (error) {
    if (error.message.startsWith('INVALID_TRANSITION')) {
      return res.status(400).json({ message: `Chuyển đổi trạng thái không hợp lệ: ${error.message}` });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
  }
};
