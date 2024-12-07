const Badge = require('../models/Badge');

module.exports = class BadgeController {





    static async createBadge(req, res) {
        const { name, description } = req.body;

        try {
            const badge = new Badge({ name, description });
            await badge.save();
            res.status(201).json({ message: 'Badge created successfully.', badge });
        } catch (error) {
            res.status(500).json({ message: 'Error creating badge.', error });
        }
    }

    static async getAllBadges(req, res) {
        try {
            const badges = await Badge.find();
            res.status(200).json(badges);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching badges.', error });
        }
    }

    static async updateBadge(req, res) {
        const { id } = req.params;
        const { name, description } = req.body;

        try {
            const badge = await Badge.findById(id);
            if (!badge) {
                return res.status(404).json({ message: 'Badge not found.' });
            }

            badge.name = name || badge.name;
            badge.description = description || badge.description;
            await badge.save();

            res.status(200).json({ message: 'Badge updated successfully.', badge });
        } catch (error) {
            res.status(500).json({ message: 'Error updating badge.', error });
        }
    }

    static async deleteBadge(req, res) {
        const { id } = req.params;

        try {
            const badge = await Badge.findByIdAndDelete(id);
            if (!badge) {
                return res.status(404).json({ message: 'Badge not found.' });
            }
            res.status(200).json({ message: 'Badge deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting badge.', error });
        }
    }
};
