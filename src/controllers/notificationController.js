const Notification = require('../models/Notification');

/**
 * @desc    Create a notification
 * @route   POST /api/notifications
 * @access  Private (Admin)
 */
const createNotification = async (req, res) => {
    const { target_role, title, message, related_entity } = req.body;

    try {
        const notification = new Notification({
            target_role,
            title,
            message,
            related_entity
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
    try {
        const userRole = req.user.role;
        
        // Match target_role: 'all' OR user's role
        // Note: user.role might be 'admin', but 'admin' isn't in target_role enum usually for these broadcasts?
        // The enum is ['buyer', 'shop', 'all'].
        // If user is 'shop', they get 'shop' and 'all'.
        // If user is 'buyer', they get 'buyer' and 'all'.
        
        const notifications = await Notification.find({
            target_role: { $in: [userRole, 'all'] }
        }).sort({ created_at: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNotification,
    getMyNotifications
};
