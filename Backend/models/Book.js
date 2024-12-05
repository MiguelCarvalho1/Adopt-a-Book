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
                required : true,
            },
            images: {
                type: Array,
                required: true,
              },
            transactionType: {
                type: String,
                required: true,
            },
            user: Object,
        },
        { timestamps: true },
    ),
);

module.exports = Book;
