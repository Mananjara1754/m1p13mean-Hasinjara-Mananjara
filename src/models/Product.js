const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        stockQuantity: { type: Number, required: true, default: 0 },
        category: { type: String, required: true },
        shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        isSponsored: { type: Boolean, default: false },
        discount: {
            type: { type: String, enum: ['PERCENT', 'FIXED', 'NONE'], default: 'NONE' },
            value: { type: Number, default: 0 },
            expiryDate: { type: Date }
        },
        images: [{ type: String }], // URLs to images
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
