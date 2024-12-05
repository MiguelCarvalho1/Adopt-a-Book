const UserBadge = require('../models/UserBadge');

module.exports = class UserBadgeController {
    static async assignBadge(req, res) {
        const { userId, badgeId } = req.body;

        try {
            const userBadge = new UserBadge({
                userId,
                badgeId,
            });

            await userBadge.save();
            res.status(201).json({ message: 'Badge assigned successfully.', userBadge });
        } catch (error) {
            res.status(500).json({ message: 'Error assigning badge.', error });
        }
    }

    static async getUserBadges(req, res) {
        const { userId } = req.params;

        try {
            const badges = await UserBadge.find({ userId }).populate('badgeId');
            res.status(200).json(badges);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching badges.', error });
        }
    }

    static async removeBadge(req, res) {
        const { id } = req.params;

        try {
            const userBadge = await UserBadge.findByIdAndDelete(id);
            if (!userBadge) {
                return res.status(404).json({ message: 'Badge not found.' });
            }
            res.status(200).json({ message: 'Badge removed successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing badge.', error });
        }
    }
};
