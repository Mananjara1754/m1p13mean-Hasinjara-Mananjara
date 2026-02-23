const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },

        participants: {
            buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }
        },

        sender_role: {
            type: String,
            enum: ['buyer', 'shop'],
            required: true
        },

        message: { type: String, required: true },
        is_read: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Message', MessageSchema);
