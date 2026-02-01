const Order = require('../models/Order');
const Product = require('../models/Product');

const generateOrderNumber = () => {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer)
const createOrder = async (req, res) => {
    const { shop_id, items, delivery } = req.body;

    if (items && items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        let subtotal = 0;
        const processedItems = [];

        // Check stock and calculate prices
        for (const item of items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(400).json({ message: `Product not found: ${item.product_id}` });
            }
            if (product.stock.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }
            
            // Use current price from product
            const unit_price = product.price.current;
            const total_price = unit_price * item.quantity;
            subtotal += total_price;

            processedItems.push({
                product_id: product._id,
                name: product.name,
                quantity: item.quantity,
                unit_price: unit_price,
                total_price: total_price
            });
        }

        const tax = subtotal * 0.2; // Example 20% tax
        const total = subtotal + tax;

        const order = new Order({
            order_number: generateOrderNumber(),
            buyer_id: req.user._id,
            shop_id,
            items: processedItems,
            amounts: {
                subtotal,
                tax,
                total,
                currency: 'EUR'
            },
            delivery
        });

        const createdOrder = await order.save();

        // Deduct stock
        for (const item of processedItems) {
            await Product.findByIdAndUpdate(item.product_id, { $inc: { 'stock.quantity': -item.quantity } });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all orders (Shop/Admin)
// @route   GET /api/orders
// @access  Private (Shop/Admin)
const getOrders = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'shop') {
            query.shop_id = req.user.shop_id;
        } else if (req.user.role === 'admin') {
            // Admin sees all
        } else {
             return res.status(403).json({ message: 'Not authorized' });
        }

        const orders = await Order.find(query)
            .populate('buyer_id', 'profile.firstname profile.lastname profile.email')
            .populate('shop_id', 'name');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer_id', 'profile.firstname profile.lastname profile.email')
            .populate('shop_id', 'name')
            .populate('items.product_id', 'name price');

        if (order) {
            // Check authorization
            if (req.user.role === 'buyer' && order.buyer_id.toString() !== req.user._id.toString()) {
                 return res.status(403).json({ message: 'Not authorized' });
            }
            if (req.user.role === 'shop' && order.shop_id.toString() !== req.user.shop_id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

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
// @access  Private (Shop/Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            // Check auth
             if (req.user.role === 'shop' && order.shop_id.toString() !== req.user.shop_id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            order.status = req.body.status || order.status;
            order.payment_status = req.body.payment_status || order.payment_status;

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
// @access  Private (Buyer)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer_id: req.user._id }).sort({ created_at: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders };
