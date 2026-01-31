const Product = require('../models/Product');

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const { shop, category, isSponsored, search } = req.query;
    let query = {};

    if (shop) query.shop = shop;
    if (category) query.category = category;
    if (isSponsored) query.isSponsored = isSponsored === 'true';
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    try {
        const products = await Product.find(query).populate('shop', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('shop', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Manager/Admin)
const createProduct = async (req, res) => {
    const { name, description, price, stockQuantity, category, shop, isSponsored, discount } = req.body;

    try {
        const product = new Product({
            name,
            description,
            price,
            stockQuantity,
            category,
            shop,
            isSponsored,
            discount,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update stock
// @route   PATCH /api/products/:id/stock
// @access  Private (Manager/Admin)
const updateStock = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.stockQuantity = req.body.stockQuantity;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateStock };
