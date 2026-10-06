const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Lấy thông tin cá nhân (yêu cầu đăng nhập)
router.get('/profile', verifyToken, userController.getProfile);

// Cập nhật thông tin cá nhân (yêu cầu đăng nhập)
router.put('/profile', verifyToken, userController.updateProfile);

// Cập nhật mật khẩu (yêu cầu đăng nhập)
router.put('/password', verifyToken, userController.updatePassword);

// Các API dành cho Admin
router.get('/', verifyToken, checkRole(['admin']), userController.getAllUsers);
router.put('/:id/status', verifyToken, checkRole(['admin']), userController.updateUserStatus);

module.exports = router;
