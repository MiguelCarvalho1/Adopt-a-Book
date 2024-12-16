const mongoose = require('../db/conn');
const { Schema } = mongoose;

const User = mongoose.model(
    "User",
    new Schema(
        {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            password: {
                type: String,
                required: true,
            },
            points: {
                type: Number,
                default: 0, 
            },
            location: {
                type: String,
            },
            profileImage: {
                type: String,
            },
            sentTransactions: [
                {
                  type: Schema.Types.ObjectId,
                  ref: 'Transaction',
                },
              ],
              receivedTransactions: [
                {
                  type: Schema.Types.ObjectId,
                  ref: 'Transaction',
                },
              ],
        },
        { timestamps: true },
    ),
);

module.exports = User;
