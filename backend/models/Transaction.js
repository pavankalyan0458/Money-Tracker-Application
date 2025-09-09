// --- backend/models/Transaction.js ---
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      index: true, // Add index for better query performance
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Wallet is required for a transaction'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add a positive amount'],
    },
    type: {
      type: String,
      required: [true, 'Please add a type'],
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index for better performance when querying by user and date
transactionSchema.index({ firebaseUid: 1, date: -1 });

// 👇 Prevent OverwriteModelError
module.exports =
  mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
