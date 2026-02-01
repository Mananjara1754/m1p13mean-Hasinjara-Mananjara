const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
    {
        payment_type: {
            type: String,
            enum: ['rent', 'order'],
            required: true
        },

        payer: {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['buyer', 'shop'], required: true }
        },

        reference: {
            order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
            shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }
        },

        amount: {
            value: { type: Number, required: true },
            currency: { type: String, default: 'EUR' }
        },

        period: {
            month: { type: String }, // e.g. "2024-04"
            billing_cycle: { type: String, default: 'monthly' }
        },

        method: {
            type: String,
            enum: ['card', 'transfer', 'wallet'],
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'overdue'],
            default: 'pending'
        },

        paid_at: { type: Date }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Payment', PaymentSchema);
