const express = require('express');
const { getRents, createRent, updateRentStatus } = require('../controllers/rentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getRents);
router.post('/', protect, authorize('ADMIN'), createRent);
router.patch('/:id', protect, authorize('ADMIN'), updateRentStatus);

module.exports = router;
