const Promotion = require('../models/Promotion');
const Shop = require('../models/Shop');

/**
 * @desc    Create a promotion
 * @route   POST /api/promotions
 * @access  Private (Shop/Admin)
 */
const createPromotion = async (req, res) => {
    const { shop_id, type, title, description, image, product_ids, budget, start_date, end_date } = req.body;

    try {
        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if (shop.owner_user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const promotion = new Promotion({
            shop_id,
            type,
            title,
            description,
            image,
            product_ids,
            budget,
            start_date,
            end_date
        });

        await promotion.save();
        res.status(201).json(promotion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get all active promotions
 * @route   GET /api/promotions
 * @access  Public
 */
const getPromotions = async (req, res) => {
    try {
        const currentDate = new Date();
        const promotions = await Promotion.find({
            is_active: true,
            start_date: { $lte: currentDate },
            end_date: { $gte: currentDate }
        })
        .populate('shop_id', 'name location')
        .populate('product_ids', 'name price image');
        
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get promotion details
 * @route   GET /api/promotions/:id
 * @access  Public
 */
const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
            .populate('shop_id', 'name')
            .populate('product_ids');

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        
        // Increment view count
        promotion.stats.views += 1;
        await promotion.save();

        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Track click/interaction
 * @route   PATCH /api/promotions/:id/click
 * @access  Public
 */
const trackClick = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { $inc: { 'stats.clicks': 1 } },
            { new: true }
        );
        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPromotion,
    getPromotions,
    getPromotionById,
    trackClick
};
