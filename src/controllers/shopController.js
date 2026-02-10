const Shop = require('../models/Shop');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
    try {
        const shops = await Shop.find({}).populate('owner_user_id', 'profile.firstname profile.lastname profile.email');
        res.json(shops);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner_user_id', 'profile.firstname profile.lastname profile.email');
        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create a shop
// @route   POST /api/shops
// @access  Private/Shop/Admin
const createShop = async (req, res) => {
    const { name, description, logo, category, location, opening_hours, rent } = req.body;

    try {
        const shop = new Shop({
            name,
            description,
            logo,
            category,
            location,
            opening_hours,
            rent,
            owner_user_id: req.user._id,
        });

        const createdShop = await shop.save();

        // Update user shop_id
        req.user.shop_id = createdShop._id;
        await req.user.save();

        res.status(201).json(createdShop);
    } catch (error) {
        console.error(error);
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
            if (shop.owner_user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this shop' });
            }

            shop.name = req.body.name || shop.name;
            shop.description = req.body.description || shop.description;
            shop.logo = req.body.logo || shop.logo;
            shop.category = req.body.category || shop.category;
            shop.location = req.body.location || shop.location;
            shop.opening_hours = req.body.opening_hours || shop.opening_hours;
            shop.rent = req.body.rent || shop.rent;

            const updatedShop = await shop.save();
            res.json(updatedShop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a shop
// @route   DELETE /api/shops/:id
// @access  Private (Owner/Admin)
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            // Check ownership
            if (shop.owner_user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this shop' });
            }

            await shop.deleteOne();
            res.json({ message: 'Shop removed' });
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getShops, getShopById, createShop, updateShop, deleteShop };
