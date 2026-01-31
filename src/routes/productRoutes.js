const express = require('express');
const { getProducts, getProductById, createProduct, updateStock } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('ADMIN', 'MANAGER'), createProduct);
router.patch('/:id/stock', protect, authorize('ADMIN', 'MANAGER'), updateStock);

module.exports = router;
