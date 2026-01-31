const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const ChatSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        messages: [MessageSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Chat', ChatSchema);
