const mongoose = require('mongoose');

const RentSchema = new mongoose.Schema(
    {
        shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['UNPAID', 'PAID', 'OVERDUE'],
            default: 'UNPAID',
        },
        paymentDate: { type: Date },
        period: { type: String }, // e.g., "January 2026"
    },
    { timestamps: true }
);

module.exports = mongoose.model('Rent', RentSchema);
