// backend/controllers/transactionController.js
const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction'); // Transaction Mongoose model
const Wallet = require('../models/Wallet');

// @desc    Get all transactions for a specific user
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
    try {
        const uid = req.user?.uid;
        console.log('🔍 Getting transactions for Firebase user:', uid);

        // Find transactions belonging to the Firebase user
        const transactions = await Transaction.find({
            firebaseUid: uid
        }).sort({ date: -1, createdAt: -1 });

        console.log(`✅ Found ${transactions.length} transactions for user ${uid}`);
        res.status(200).json(transactions);
    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        res.status(500);
        throw new Error('Failed to fetch transactions');
    }
});

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = asyncHandler(async (req, res) => {
    try {
        const { description, amount, type, category, date, walletId } = req.body;
        const uid = req.user?.uid;

        console.log('➕ Adding transaction for Firebase user:', uid);
        console.log('📝 Transaction data:', { description, amount, type, category, date, walletId });

        // Validate required fields
        if (!description || !amount || !type || !category || !date || !walletId) {
            res.status(400);
            throw new Error('Please add all fields including walletId');
        }

        // Validate wallet ownership and adjust balance
        const wallet = await Wallet.findOne({ _id: walletId, userId: req.userId });
        if (!wallet) {
            res.status(404);
            throw new Error('Wallet not found');
        }

        // Create a new transaction with Firebase UID
        const transaction = await Transaction.create({
            firebaseUid: uid, // Use Firebase UID
            walletId,
            description,
            amount,
            type,
            category,
            date: new Date(date), // Convert date string to Date object
        });

        // Update wallet balance
        if (type === 'expense') {
            if (wallet.balance < amount) {
                // Rollback created transaction
                await Transaction.deleteOne({ _id: transaction._id });
                res.status(400);
                throw new Error('Insufficient wallet balance');
            }
            wallet.balance -= Number(amount);
        } else if (type === 'income') {
            wallet.balance += Number(amount);
        }
        await wallet.save();

        console.log('✅ Transaction created successfully:', transaction._id);
        res.status(201).json(transaction);
    } catch (error) {
        console.error('❌ Error creating transaction:', error);
        res.status(500);
        throw new Error('Failed to create transaction');
    }
});

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
    try {
        const { description, amount, type, category, date } = req.body;

        const uid = req.user?.uid;
        console.log('✏️ Updating transaction:', req.params.id, 'for user:', uid);

        // Find the transaction by ID
        let transaction = await Transaction.findById(req.params.id);

        // Check if transaction exists
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }

        // Ensure the Firebase user owns the transaction
        if (transaction.firebaseUid !== uid) {
            res.status(401);
            throw new Error('User not authorized to update this transaction');
        }

        // Update transaction fields
        transaction.description = description !== undefined ? description : transaction.description;
        transaction.amount = amount !== undefined ? amount : transaction.amount;
        transaction.type = type !== undefined ? type : transaction.type;
        transaction.category = category !== undefined ? category : transaction.category;
        transaction.date = date !== undefined ? new Date(date) : transaction.date;

        // Save the updated transaction
        const updatedTransaction = await transaction.save();
        console.log('✅ Transaction updated successfully:', updatedTransaction._id);
        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error('❌ Error updating transaction:', error);
        res.status(500);
        throw new Error('Failed to update transaction');
    }
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
    try {
        const uid = req.user?.uid;
        console.log('🗑️ Deleting transaction:', req.params.id, 'for user:', uid);

        // Find the transaction by ID
        const transaction = await Transaction.findById(req.params.id);

        // Check if transaction exists
        if (!transaction) {
            res.status(404);
            throw new Error('Transaction not found');
        }

        // Ensure the Firebase user owns the transaction
        if (transaction.firebaseUid !== uid) {
            res.status(401);
            throw new Error('User not authorized to delete this transaction');
        }

        // Adjust wallet balance back before deleting
        const wallet = await Wallet.findById(transaction.walletId);
        if (wallet) {
            if (transaction.type === 'expense') {
                wallet.balance += Number(transaction.amount);
            } else if (transaction.type === 'income') {
                wallet.balance -= Number(transaction.amount);
            }
            await wallet.save();
        }

        // Delete the transaction after balance adjustment
        await transaction.deleteOne();
        console.log('✅ Transaction deleted successfully:', req.params.id);
        res.status(200).json({ message: 'Transaction removed successfully' });
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        res.status(500);
        throw new Error('Failed to delete transaction');
    }
});

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
};