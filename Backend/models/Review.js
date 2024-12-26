const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Review = mongoose.model(
    'Review',
    new Schema(
        {
            bookId: {
                type: Schema.Types.ObjectId,
                ref: 'Book',
                required: true,
            },
            reviewedUserId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: [1, 'The minimum assessment is 1'],
                max: [5, 'The maximum assessment is 5'],
            },
            comment: {
                type: String,
            },
        },
        { timestamps: true }
    )
);

module.exports = Review;
