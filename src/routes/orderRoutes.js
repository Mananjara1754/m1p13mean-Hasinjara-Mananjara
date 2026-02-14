const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders, getOrderStats, getMyOrdersByDate } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders/stats/total-by-status/{shop_id}:
 *   get:
 *     summary: Get order total per status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics object
 */
router.get('/stats/total-by-status/:shop_id', protect, authorize('shop', 'admin'), getOrderStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - shop_id
 *         - items
 *       properties:
 *         shop_id:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product_id:
 *                  type: string
 *               quantity:
 *                  type: number
 *         delivery:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             address:
 *               type: string
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Shop/Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders with pagination
 */
router.get('/', protect, authorize('shop', 'admin'), getOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', protect, createOrder);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my orders
 */
router.get('/myorders', protect, getMyOrders);

/**
 * @swagger
 * /api/orders/myorders/by-date:
 *   get:
 *     summary: Get my orders by date
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of my orders filtered by date
 */
router.get('/myorders/by-date', protect, getMyOrdersByDate);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order details
 */
router.get('/:id', protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               payment_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 */
router.patch('/:id/status', protect, authorize('shop', 'admin'), updateOrderStatus);

module.exports = router;
