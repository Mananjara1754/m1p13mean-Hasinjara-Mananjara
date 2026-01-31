const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                priceAtPurchase: { type: Number, required: true },
            },
        ],
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED'],
            default: 'PENDING',
        },
        trackingNumber: { type: String },
        paymentStatus: {
            type: String,
            enum: ['UNPAID', 'PAID', 'REFUNDED'],
            default: 'UNPAID',
        },
        invoiceUrl: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
