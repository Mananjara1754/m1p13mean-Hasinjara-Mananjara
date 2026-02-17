const express = require('express');
const router = express.Router();
const { validateRent, getRentStatus } = require('../controllers/rentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management routes
 */

/**
 * @swagger
 * /api/admin/rent/validate/{id}:
 *   put:
 *     summary: Validate a rent payment
 *     tags: [Admin]
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
 *         description: Payment validated
 */
router.put('/rent/validate/:id', protect, authorize('admin'), validateRent);

/**
 * @swagger
 * /api/admin/rent/status:
 *   get:
 *     summary: Get rent status of all shops for a specific period
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shops with payment status
 */
router.get('/rent/status', protect, authorize('admin'), getRentStatus);

module.exports = router;
