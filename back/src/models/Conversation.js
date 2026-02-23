const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
    {
        participants: {
            buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }
        },

        last_message: {
            sender_role: { type: String, enum: ['buyer', 'shop'] },
            content: { type: String },
            sent_at: { type: Date }
        },

        unread_count: {
            buyer: { type: Number, default: 0 },
            shop: { type: Number, default: 0 }
        },

        status: {
            type: String,
            enum: ['active', 'archived', 'closed'],
            default: 'active'
        },

        context: {
            order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
