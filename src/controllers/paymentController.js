const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = async (req, res) => {
    const { payment_type, reference, amount, period, method } = req.body;

    try {
        const paymentData = {
            payment_type,
            payer: {
                user_id: req.user._id,
                role: req.user.role
            },
            reference,
            amount,
            method,
            status: 'paid', // Simulating successful payment
            paid_at: new Date()
        };

        if (payment_type === 'rent') {
            paymentData.period = period;
        }

        const payment = new Payment(paymentData);
        await payment.save();

        // Update related entity status
        if (payment_type === 'order' && reference.order_id) {
            await Order.findByIdAndUpdate(reference.order_id, {
                payment_status: 'paid',
                status: 'processing'
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('payer.user_id', 'username email')
            .populate('reference.order_id')
            .populate('reference.shop_id');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Access control: only admin, payer, or shop owner (for rent) can view
        if (req.user.role !== 'admin' &&
            payment.payer.user_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get my payments
 * @route   GET /api/payments/my-payments
 * @access  Private
 */
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ 'payer.user_id': req.user._id })
            .sort({ created_at: -1 });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get all payments (Admin only)
 * @route   GET /api/payments
 * @access  Private/Admin
 */
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('payer.user_id', 'username email')
            .sort({ created_at: -1 });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPayment,
    getPaymentById,
    getMyPayments,
    getAllPayments
};
