const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khách hàng đặt sân (yêu cầu login và role customer)
router.post(
  '/',
  verifyToken,
  checkRole(['customer'], 'Tài khoản Chủ sân không thể thực hiện đặt sân. Vui lòng sử dụng tài khoản Khách hàng.'),
  bookingController.createBooking
);

// Lấy danh sách booking (Chỉ admin, owner và customer)
router.get('/', verifyToken, checkRole(['admin', 'owner', 'customer']), bookingController.getAllBookings);

// Cập nhật trạng thái booking (Chỉ admin và owner)
router.put('/:id/status', verifyToken, checkRole(['admin', 'owner']), bookingController.updateBookingStatus);

module.exports = router;
