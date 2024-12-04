const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Review = mongoose.model(
    "Review",
    new Schema(
        {
            transactionId: {
                type: Schema.Types.ObjectId,
                ref: "Transaction",
                required: true,
            },
            reviewerId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            reviewedUserId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5, 
            },
            comment: {
                type: String,
            },
        },
        { timestamps: true },
    ),
);

module.exports = Review;
