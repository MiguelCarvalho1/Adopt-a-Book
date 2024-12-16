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
        images: {
            type: Array,
            required: true,
          },
        transactionType: {
          type: String,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User', 
          required: true,
        },
        transactions: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Transaction',
          },
        ],
      },
    { timestamps: true }
  )
);

module.exports = Book;



