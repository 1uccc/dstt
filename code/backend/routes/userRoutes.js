const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Lấy thông tin cá nhân (yêu cầu đăng nhập)
router.get('/profile', verifyToken, userController.getProfile);

// Cập nhật mật khẩu (yêu cầu đăng nhập)
router.put('/password', verifyToken, userController.updatePassword);

// Ví dụ route chỉ dành cho Admin hoặc Owner
router.get('/admin-only', verifyToken, checkRole(['admin', 'owner']), (req, res) => {
  res.json({ message: 'Đây là dữ liệu chỉ dành cho Admin hoặc Owner.' });
});

module.exports = router;
