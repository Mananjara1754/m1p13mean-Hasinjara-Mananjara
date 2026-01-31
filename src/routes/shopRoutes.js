const express = require('express');
const { getShops, getShopById, createShop, updateShop } = require('../controllers/shopController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getShops);
router.get('/:id', getShopById);
router.post('/', protect, authorize('ADMIN', 'MANAGER'), createShop);
router.put('/:id', protect, authorize('ADMIN', 'MANAGER'), updateShop);

module.exports = router;
