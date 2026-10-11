const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getOwnerPaymentSettings, updateOwnerPaymentSettings } = require('../controllers/settingController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', verifyToken, checkRole(['admin']), updateSettings);

// API for owner payment settings
router.get('/payment/:ownerId', getOwnerPaymentSettings);
router.put('/payment', verifyToken, checkRole(['owner']), updateOwnerPaymentSettings);

module.exports = router;
