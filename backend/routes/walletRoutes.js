// --- backend/routes/walletRoutes.js ---
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
  transfer,
} = require('../controllers/walletController');

// Create and list wallets
router.route('/')
  .post(protect, createWallet)
  .get(protect, getWallets);

// Update / Delete wallet by id
router.route('/:id')
  .put(protect, updateWallet)
  .delete(protect, deleteWallet);

// Transfer endpoint
router.post('/transfer', protect, transfer);

module.exports = router;


