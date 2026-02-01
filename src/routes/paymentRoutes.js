const express = require('express');
const router = express.Router();
const {
    createPayment,
    getPaymentById,
    getMyPayments,
    getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - payment_type
 *         - amount
 *         - method
 *       properties:
 *         payment_type:
 *           type: string
 *           enum: [rent, order]
 *         reference:
 *           type: object
 *           properties:
 *             order_id:
 *               type: string
 *             shop_id:
 *               type: string
 *         amount:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *             currency:
 *               type: string
 *         period:
 *           type: object
 *           properties:
 *             month:
 *               type: string
 *             billing_cycle:
 *               type: string
 *         method:
 *           type: string
 *           enum: [card, transfer, wallet]
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, overdue]
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created
 *       400:
 *         description: Invalid input
 */
router.post('/', protect, createPayment);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get current user's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/my-payments', protect, getMyPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:id', protect, getPaymentById);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;
