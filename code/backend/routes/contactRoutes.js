const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/', contactController.createContact);
router.get('/', verifyToken, checkRole(['admin']), contactController.getContacts);
router.put('/:id', verifyToken, checkRole(['admin']), contactController.updateContactStatus);

module.exports = router;
