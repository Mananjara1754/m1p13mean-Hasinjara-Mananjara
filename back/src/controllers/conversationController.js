const Conversation = require('../models/Conversation');
const Shop = require('../models/Shop');

/**
 * @desc    Create or get existing conversation
 * @route   POST /api/conversations
 * @access  Private
 */
const createConversation = async (req, res) => {
    const { shop_id, product_id, order_id } = req.body;

    try {
        // Determine shop owner logic if needed, but here we assume buyer initiates
        // or shop initiates.
        // For simplicity, let's assume the logged-in user is the buyer initiating contact with a shop.
        // If the logged in user IS the shop owner, they might be initiating with a buyer (less common in this flow but possible).

        // Basic flow: User (Buyer) -> Shop
        const buyer_id = req.user._id;

        // Check if conversation already exists
        let query = {
            'participants.buyer_id': buyer_id,
            'participants.shop_id': shop_id
        };

        // If context is important (e.g. separate conversation per order), add it to query
        if (order_id) {
            query['context.order_id'] = order_id;
        }

        let conversation = await Conversation.findOne(query);

        if (conversation) {
            return res.json(conversation);
        }

        conversation = new Conversation({
            participants: {
                buyer_id,
                shop_id
            },
            context: {
                product_id,
                order_id
            }
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get my conversations
 * @route   GET /api/conversations
 * @access  Private
 */
const getMyConversations = async (req, res) => {
    try {
        // User can be a buyer or a shop owner
        // 1. Find conversations where user is the buyer
        // 2. Find shops owned by user, then find conversations for those shops

        const shopsOwned = await Shop.find({ owner_user_id: req.user._id });
        const shopIds = shopsOwned.map(shop => shop._id);

        const conversations = await Conversation.find({
            $or: [
                { 'participants.buyer_id': req.user._id },
                { 'participants.shop_id': { $in: shopIds } }
            ]
        })
            .populate('participants.buyer_id', 'username profile')
            .populate('participants.shop_id', 'name')
            .sort({ 'last_message.sent_at': -1 });

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get conversation by ID
 * @route   GET /api/conversations/:id
 * @access  Private
 */
const getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('participants.buyer_id', 'username profile')
            .populate('participants.shop_id', 'name')
            .populate('context.order_id')
            .populate('context.product_id');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access
        const isBuyer = conversation.participants.buyer_id._id.toString() === req.user._id.toString();

        // Check if user owns the shop
        let isShopOwner = false;
        const shop = await Shop.findById(conversation.participants.shop_id._id);
        if (shop && shop.owner_user_id.toString() === req.user._id.toString()) {
            isShopOwner = true;
        }

        if (!isBuyer && !isShopOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(conversation);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createConversation,
    getMyConversations,
    getConversationById
};
