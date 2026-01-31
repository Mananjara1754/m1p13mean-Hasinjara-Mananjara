const Shop = require('../models/Shop');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
    try {
        const shops = await Shop.find({}).populate('owner', 'name email');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a shop
// @route   POST /api/shops
// @access  Private/Admin/Manager
const createShop = async (req, res) => {
    const { name, location, category, openingHours } = req.body;

    try {
        const shop = new Shop({
            name,
            owner: req.user._id,
            location,
            category,
            openingHours,
        });

        const createdShop = await shop.save();
        res.status(201).json(createdShop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a shop
// @route   PUT /api/shops/:id
// @access  Private (Owner/Admin)
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            // Check ownership
            if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Not authorized to update this shop' });
            }

            shop.name = req.body.name || shop.name;
            shop.location = req.body.location || shop.location;
            shop.category = req.body.category || shop.category;
            shop.openingHours = req.body.openingHours || shop.openingHours;

            const updatedShop = await shop.save();
            res.json(updatedShop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getShops, getShopById, createShop, updateShop };
