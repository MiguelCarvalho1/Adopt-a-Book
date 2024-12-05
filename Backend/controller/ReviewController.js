const Review = require('../models/Review');

module.exports = class ReviewController {
    static async createReview(req, res) {
        const { userId, rating, comment } = req.body;

        try {
            const review = new Review({
                userId,
                rating,
                comment,
                reviewerId: req.user.id,
            });

            await review.save();
            res.status(201).json({ message: 'Review added successfully.', review });
        } catch (error) {
            res.status(500).json({ message: 'Error creating review.', error });
        }
    }

    static async getUserReviews(req, res) {
        const { userId } = req.params;

        try {
            const reviews = await Review.find({ userId }).populate('reviewerId');
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching reviews.', error });
        }
    }

    static async updateReview(req, res) {
        const { id } = req.params;
        const { rating, comment } = req.body;

        try {
            const review = await Review.findById(id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found.' });
            }

            review.rating = rating || review.rating;
            review.comment = comment || review.comment;
            await review.save();

            res.status(200).json({ message: 'Review updated successfully.', review });
        } catch (error) {
            res.status(500).json({ message: 'Error updating review.', error });
        }
    }

    static async deleteReview(req, res) {
        const { id } = req.params;

        try {
            const review = await Review.findByIdAndDelete(id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found.' });
            }
            res.status(200).json({ message: 'Review deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting review.', error });
        }
    }
};
