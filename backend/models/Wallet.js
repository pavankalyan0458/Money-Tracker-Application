// --- backend/models/Wallet.js ---
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wallet name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['cash', 'bank', 'card', 'crypto'],
      default: 'cash',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 👇 Prevent OverwriteModelError
module.exports = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);


