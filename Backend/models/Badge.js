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
            pointsRequired: {
              type: Number, // Definir a quantidade de pontos necessária para o crachá
              required: true,
            },
          },
          { timestamps: true }
        ),
);

module.exports = Badge;
