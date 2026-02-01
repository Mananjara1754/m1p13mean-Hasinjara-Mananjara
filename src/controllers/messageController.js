const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Shop = require('../models/Shop');

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
    const { conversation_id, content } = req.body;

    try {
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Determine sender role (buyer or shop)
        let sender_role = 'buyer';
        let isParticipant = false;

        if (conversation.participants.buyer_id.toString() === req.user._id.toString()) {
            isParticipant = true;
            sender_role = 'buyer';
        } else {
            // Check if user owns the shop
            const shop = await Shop.findById(conversation.participants.shop_id);
            if (shop && shop.owner_user_id.toString() === req.user._id.toString()) {
                isParticipant = true;
                sender_role = 'shop';
            }
        }

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to send message to this conversation' });
        }

        const message = new Message({
            conversation_id,
            participants: conversation.participants,
            sender_role,
            message: content,
            is_read: false
        });

        await message.save();

        // Update conversation
        const updateData = {
            last_message: {
                sender_role,
                content,
                sent_at: new Date()
            }
        };

        // Increment unread count
        if (sender_role === 'buyer') {
            updateData.$inc = { 'unread_count.shop': 1 };
        } else {
            updateData.$inc = { 'unread_count.buyer': 1 };
        }

        await Conversation.findByIdAndUpdate(conversation_id, updateData);

        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/:conversation_id
 * @access  Private
 */
const getMessages = async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const conversation = await Conversation.findById(conversation_id);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Access control
        let isParticipant = false;
        let userRole = 'buyer'; // default perspective

        if (conversation.participants.buyer_id.toString() === req.user._id.toString()) {
            isParticipant = true;
        } else {
            const shop = await Shop.findById(conversation.participants.shop_id);
            if (shop && shop.owner_user_id.toString() === req.user._id.toString()) {
                isParticipant = true;
                userRole = 'shop';
            }
        }

        if (!isParticipant && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ conversation_id }).sort({ created_at: 1 });

        // Mark messages as read if I am the recipient
        // If I am buyer, I read messages from shop
        // If I am shop, I read messages from buyer
        
        // However, a simpler approach is to reset the unread_count for my role in the Conversation
        // AND mark individual messages as read.
        
        // Reset unread count
        const updateUnread = {};
        if (userRole === 'buyer') {
            updateUnread['unread_count.buyer'] = 0;
        } else {
            updateUnread['unread_count.shop'] = 0;
        }
        await Conversation.findByIdAndUpdate(conversation_id, { $set: updateUnread });

        // Mark messages as read (optional, but good for granularity)
        // Update all messages where sender_role is NOT my role
        await Message.updateMany(
            { conversation_id, sender_role: { $ne: userRole }, is_read: false },
            { is_read: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages
};
