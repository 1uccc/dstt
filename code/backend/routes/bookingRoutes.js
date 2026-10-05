const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khách hàng đặt sân (có thể yêu cầu login hoặc không, tạm thời để mở hoặc verifyToken tuỳ ý, frontend đang có Checkout form)
// Sẽ dùng một middleware lấy user nếu có truyền token, nếu không thì pass. Tạm dùng bình thường.
router.post('/', bookingController.createBooking);

// Lấy danh sách booking (Chỉ admin và owner)
router.get('/', verifyToken, checkRole(['admin', 'owner']), bookingController.getAllBookings);

// Cập nhật trạng thái booking (Chỉ admin và owner)
router.put('/:id/status', verifyToken, checkRole(['admin', 'owner']), bookingController.updateBookingStatus);

module.exports = router;
