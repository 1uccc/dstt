const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khách hàng có thể xem danh sách sân (không cần token, hoặc có tuỳ logic)
router.get('/', fieldController.getAllFields);
router.get('/:id', fieldController.getFieldById);

// Admin và Owner có thể thêm, sửa, xóa
router.post('/', verifyToken, checkRole(['admin', 'owner']), fieldController.createField);
router.put('/:id', verifyToken, checkRole(['admin', 'owner']), fieldController.updateField);
router.delete('/:id', verifyToken, checkRole(['admin', 'owner']), fieldController.deleteField);

module.exports = router;
