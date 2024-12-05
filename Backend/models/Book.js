const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Book = mongoose.model(
    "Book",
    new Schema(
        {
            title: {
                type: String,
                required: true,
            },
            author: {
                type: String,
                required: true,
            },
            genre: {
                type: String,
            },
            language: {
                type: String,
            },
            condition: {
                type: String,
                required: true, 
            },
            description: {
                type: String,
            },
            quantity: {
                type: Number,
            },
            imageUrl: {
                type: String,
            },
            transactionType: {
                type: String,
                enum: ["Exchange", "Donation"], 
                required: true,
            },
            ownerId: {
                type: Schema.Types.ObjectId,
                ref: "User", 
                required: true,
            },
        },
        { timestamps: true },
    ),
);

module.exports = Book;
