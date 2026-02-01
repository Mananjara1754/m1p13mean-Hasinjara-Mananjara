const Product = require('../models/Product');

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const { shop_id, category, search } = req.query;
    let query = {};

    if (shop_id) query.shop_id = shop_id;
    if (category) query.category = category;
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    // Only active products unless admin/shop owner asks? For now public sees all or active?
    // User design has is_active. Usually public gets active only.
    query.is_active = true;

    try {
        const products = await Product.find(query).populate('shop_id', 'name');
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
        const product = await Product.findById(req.params.id).populate('shop_id', 'name');
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
// @access  Private (Shop/Admin)
const createProduct = async (req, res) => {
    const { name, description, category, images, price, price_history, stock, promotion, is_active } = req.body;
    
    // Ensure shop_id comes from user if they are a shop, or body if admin
    let shop_id = req.body.shop_id;
    if (req.user.role === 'shop') {
        shop_id = req.user.shop_id; // Assuming user has shop_id, or we need to find their shop.
        // The user model has shop_id now.
    }

    try {
        const product = new Product({
            shop_id,
            name,
            description,
            category,
            images,
            price,
            price_history,
            stock,
            promotion,
            is_active
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Shop/Admin)
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
             // Check ownership if shop
             if (req.user.role === 'shop' && product.shop_id.toString() !== req.user.shop_id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
             }

            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.category = req.body.category || product.category;
            product.images = req.body.images || product.images;
            product.price = req.body.price || product.price;
            product.price_history = req.body.price_history || product.price_history;
            product.stock = req.body.stock || product.stock;
            product.promotion = req.body.promotion || product.promotion;
            product.is_active = req.body.is_active !== undefined ? req.body.is_active : product.is_active;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Shop/Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
             // Check ownership if shop
             if (req.user.role === 'shop' && product.shop_id.toString() !== req.user.shop_id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
             }

            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
