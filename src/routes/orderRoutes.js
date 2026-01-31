const express = require('express');
const { addOrderItems, getOrderById, updateOrderStatus, getMyOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER'), updateOrderStatus);

module.exports = router;
