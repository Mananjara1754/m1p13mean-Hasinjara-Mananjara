const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages
} = require('../controllers/messageController');
const { protect } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         conversation_id:
 *           type: string
 *         sender_role:
 *           type: string
 *           enum: [buyer, shop]
 *         message:
 *           type: string
 *         is_read:
 *           type: boolean
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *               - content
 *             properties:
 *               conversation_id:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', protect, sendMessage);

/**
 * @swagger
 * /api/messages/{conversation_id}:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/:conversation_id', protect, getMessages);

module.exports = router;
