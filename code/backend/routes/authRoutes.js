const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Đồng bộ user từ Firebase Auth vào Firestore (gọi sau khi login/register ở frontend)
router.post('/sync', verifyToken, authController.syncUser);

// Các route cũ (nếu frontend lỡ gọi sẽ nhận thông báo)
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
