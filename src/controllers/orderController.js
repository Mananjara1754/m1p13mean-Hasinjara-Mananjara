const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer)
const addOrderItems = async (req, res) => {
    const { shop, items, totalPrice } = req.body;

    if (items && items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        // Check stock for each item
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product ? product.name : 'Unknown'}` });
            }
        }

        const order = new Order({
            buyer: req.user._id,
            shop,
            items,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Deduct stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name email')
            .populate('shop', 'name')
            .populate('items.product', 'name price');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Manager/Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addOrderItems, getOrderById, updateOrderStatus, getMyOrders };
