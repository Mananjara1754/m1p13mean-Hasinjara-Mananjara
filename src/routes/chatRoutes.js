const express = require('express');
const { getOrCreateChat, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, getOrCreateChat);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
