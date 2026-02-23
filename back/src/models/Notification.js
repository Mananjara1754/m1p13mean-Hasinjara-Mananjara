const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        target_role: {
            type: String,
            enum: ['buyer', 'shop', 'all'],
            required: true
        },

        title: { type: String, required: true },
        message: { type: String, required: true },

        related_entity: {
            type: {
                type: String,
                enum: ['promotion', 'order', 'payment']
            },
            id: { type: mongoose.Schema.Types.ObjectId }
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Notification', NotificationSchema);
