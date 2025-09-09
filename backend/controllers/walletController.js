// --- backend/controllers/walletController.js ---
const asyncHandler = require('express-async-handler');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Create new wallet
// POST /api/wallets
const createWallet = asyncHandler(async (req, res) => {
  const { name, type = 'cash', balance = 0 } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Wallet name is required');
  }

  const wallet = await Wallet.create({
    name,
    type,
    balance,
    userId: req.userId,
  });

  res.status(201).json(wallet);
});

// Get all wallets for logged-in user
// GET /api/wallets
const getWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.status(200).json(wallets);
});

// Update wallet (name/type)
// PUT /api/wallets/:id
const updateWallet = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.userId });

  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  if (name !== undefined) wallet.name = name;
  if (type !== undefined) wallet.type = type;

  await wallet.save();
  res.status(200).json(wallet);
});

// Delete wallet (only if no transactions linked)
// DELETE /api/wallets/:id
const deleteWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.userId });

  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  const txCount = await Transaction.countDocuments({ walletId: wallet._id });
  if (txCount > 0) {
    res.status(400);
    throw new Error('Cannot delete wallet with existing transactions');
  }

  await wallet.deleteOne();
  res.status(200).json({ message: 'Wallet deleted successfully' });
});

// Transfer money between wallets
// POST /api/wallets/transfer
const transfer = asyncHandler(async (req, res) => {
  const { fromWalletId, toWalletId, amount } = req.body;

  const numericAmount = Number(amount);
  if (!fromWalletId || !toWalletId || !numericAmount || numericAmount <= 0) {
    res.status(400);
    throw new Error('fromWalletId, toWalletId and positive amount are required');
  }

  if (fromWalletId === toWalletId) {
    res.status(400);
    throw new Error('Cannot transfer to the same wallet');
  }

  const [fromWallet, toWallet] = await Promise.all([
    Wallet.findOne({ _id: fromWalletId, userId: req.userId }),
    Wallet.findOne({ _id: toWalletId, userId: req.userId }),
  ]);

  if (!fromWallet || !toWallet) {
    res.status(404);
    throw new Error('One or both wallets not found');
  }

  if (fromWallet.balance < numericAmount) {
    res.status(400);
    throw new Error('Insufficient funds in source wallet');
  }

  // Adjust balances
  fromWallet.balance -= numericAmount;
  toWallet.balance += numericAmount;

  await Promise.all([fromWallet.save(), toWallet.save()]);

  // Create two transactions
  const nowIso = new Date().toISOString();
  const [expenseTx, incomeTx] = await Promise.all([
    Transaction.create({
      firebaseUid: req.user?.uid || req.firebaseUser?.uid, // support either middleware shape
      walletId: fromWallet._id,
      description: `Transfer to ${toWallet.name}`,
      amount: numericAmount,
      type: 'expense',
      category: 'Transfer',
      date: nowIso,
    }),
    Transaction.create({
      firebaseUid: req.user?.uid || req.firebaseUser?.uid,
      walletId: toWallet._id,
      description: `Transfer from ${fromWallet.name}`,
      amount: numericAmount,
      type: 'income',
      category: 'Transfer',
      date: nowIso,
    }),
  ]);

  res.status(201).json({ message: 'Transfer successful', expenseTx, incomeTx, fromWallet, toWallet });
});

module.exports = {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
  transfer,
};


