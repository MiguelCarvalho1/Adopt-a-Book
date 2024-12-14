const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Transaction = mongoose.model(
  "Transaction",
  new Schema(
    {
      bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Completed", "Rejected"],
        default: "Pending",
      },
      pointsExchanged: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  )
);

module.exports = Transaction;
