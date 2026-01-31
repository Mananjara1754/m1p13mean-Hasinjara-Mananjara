const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            floor: { type: String },
            address: { type: String, required: true },
        },
        category: { type: String, required: true },
        openingHours: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Shop', ShopSchema);
