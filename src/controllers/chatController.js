const Chat = require('../models/Chat');

// @desc    Get or create chat between two users
// @route   POST /api/chats
// @access  Private
const getOrCreateChat = async (req, res) => {
    const { receiverId } = req.body;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, receiverId] },
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, receiverId],
                messages: [],
            });
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
    const { content, receiverId } = req.body;

    try {
        const chat = await Chat.findById(req.params.id);

        if (chat) {
            const message = {
                sender: req.user._id,
                receiver: receiverId,
                content,
            };

            chat.messages.push(message);
            await chat.save();
            res.status(201).json(message);
        } else {
            res.status(404).json({ message: 'Chat not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrCreateChat, sendMessage };
