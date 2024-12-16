const mongoose = require('../db/conn');
const { Schema } = mongoose;

const UserBadge = mongoose.model(
    "UserBadge",
    new Schema(
        {
            userId: {
              type: Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            badgeId: {
              type: Schema.Types.ObjectId,
              ref: 'Badge',
              required: true,
            },
            awardedAt: {
              type: Date,
              default: Date.now,
            },
          },
          { timestamps: true }
        ),
);

module.exports = UserBadge;
