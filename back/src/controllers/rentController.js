const Payment = require('../models/Payment');
const Shop = require('../models/Shop');

/**
 * @desc    Pay rent (Create pending payment)
 * @route   POST /api/shops/rent/pay
 * @access  Private (Shop Owner)
 */
const payRent = async (req, res) => {
    try {
        const { shop_id, month, year } = req.body;
        const periodStr = `${year}-${month}`;

        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check if user is owner
        if (shop.owner_user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if payment already exists for this period
        const existingPayment = await Payment.findOne({
            'reference.shop_id': shop_id,
            'period.month': periodStr,
            payment_type: 'rent',
            status: { $in: ['paid', 'pending'] }
        });

        if (existingPayment) {
            return res.status(400).json({ message: 'Rent for this period is already paid or pending' });
        }

        const payment = new Payment({
            payment_type: 'rent',
            payer: {
                user_id: req.user._id,
                role: 'shop'
            },
            reference: {
                shop_id: shop_id
            },
            amount: {
                value: shop.rent.amount,
                currency: shop.rent.currency || 'MGA'
            },
            period: {
                month: periodStr,
                billing_cycle: 'monthly'
            },
            method: 'transfer', // Default method for now
            status: 'pending'
        });

        await payment.save();
        res.status(201).json(payment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Validate rent payment
 * @route   PUT /api/admin/rent/validate/:id
 * @access  Private (Admin)
 */
const validateRent = async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.payment_type !== 'rent') {
            return res.status(400).json({ message: 'Not a rent payment' });
        }

        if (method) {
            payment.method = method;
        }

        payment.status = 'paid';
        payment.paid_at = Date.now();
        await payment.save();

        res.json(payment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get shops rent status for a specific period
 * @route   GET /api/admin/rent/status
 * @access  Private (Admin)
 */
const getRentStatus = async (req, res) => {
    try {
        const { month, year, status } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: 'Month and Year are required' });
        }

        const periodStr = `${year}-${month}`;

        // Get all shops
        // Optimization: We could use aggregation here
        const shops = await Shop.find().populate('owner_user_id', 'username email');
        
        // Get all rent payments for this period
        const payments = await Payment.find({
            payment_type: 'rent',
            'period.month': periodStr
        });

        // Map payments by shop_id
        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.reference.shop_id.toString()] = p;
        });

        const result = shops.map(shop => {
            const payment = paymentMap[shop._id.toString()];
            return {
                shop: {
                    _id: shop._id,
                    name: shop.name,
                    logo: shop.logo,
                    owner: shop.owner_user_id,
                    rent_amount: shop.rent?.amount
                },
                payment_status: payment ? payment.status : 'unpaid',
                payment_id: payment ? payment._id : null,
                payment_date: payment ? (payment.paid_at || payment.created_at) : null
            };
        });

        // Filter if status is provided
        if (status) {
            const filtered = result.filter(item => item.payment_status === status);
            return res.json(filtered);
        }

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    payRent,
    validateRent,
    getRentStatus
};
