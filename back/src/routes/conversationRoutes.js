const express = require('express');
const router = express.Router();
const {
    createConversation,
    getMyConversations,
    getConversationById
} = require('../controllers/conversationController');
const { protect } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         participants:
 *           type: object
 *           properties:
 *             buyer_id:
 *               type: string
 *             shop_id:
 *               type: string
 *         last_message:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             sent_at:
 *               type: string
 *               format: date-time
 *         context:
 *           type: object
 *           properties:
 *             order_id:
 *               type: string
 *             product_id:
 *               type: string
 */

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create or get conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_id
 *             properties:
 *               shop_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created or returned
 */
router.post('/', protect, createConversation);

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get my conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/', protect, getMyConversations);

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Get conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get('/:id', protect, getConversationById);

module.exports = router;
