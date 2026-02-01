const express = require('express');
const router = express.Router();
const {
    createNotification,
    getMyNotifications
} = require('../controllers/notificationController');
const { protect, authorize } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - target_role
 *         - title
 *         - message
 *       properties:
 *         target_role:
 *           type: string
 *           enum: [buyer, shop, all]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         related_entity:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [promotion, order, payment]
 *             id:
 *               type: string
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/', protect, authorize('admin'), createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', protect, getMyNotifications);

module.exports = router;
