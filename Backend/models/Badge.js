const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Badge = mongoose.model(
    "Badge",
    new Schema(
        {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
            iconUrl: {
                type: String,
            },
        },
        { timestamps: true },
    ),
);

module.exports = Badge;
