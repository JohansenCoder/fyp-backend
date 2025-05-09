const {User}= require('../models/UserSchema');


// Register device token for push notifications
exports.registerDeviceToken = 
    
    async (req, res) => {
        // validate request body
        if (!req.body.token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        try {
            const { token } = req.body;
            const user = await User.findById(req.user.id);
            if (!user.fcmTokens) user.fcmTokens = [];
            if (!user.fcmTokens.includes(token)) {
                user.fcmTokens.push(token);
                await user.save();
            }
            res.json({ message: 'Device token registered' });
        } catch (error) {
            logger.error(`Register token error: ${error.message}`);
            res.status(500).json({ message: 'Failed to register token' });
        }
    },


// Update user's FCM token
exports.updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.user.userId, { fcmToken });
        res.json({ message: 'FCM token updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
