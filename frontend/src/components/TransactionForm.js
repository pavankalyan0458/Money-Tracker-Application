import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react'; // Icons
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook for authentication
import { getWallets, createWallet } from '../api/api'; // Delegate create/update to parent; createWallet used for quick add
import WalletModal from './WalletModal';
import { toast } from 'react-hot-toast'; // Import toast for notifications

/**
 * Form component for adding or editing transaction details.
 * * @param {object} props - Component props.
 * @param {function} props.onSave - Callback function when the form is saved.
 * @param {object} [props.initialData=null] - Initial data for editing an existing transaction.
 * @param {function} props.onCancel - Callback function when the form is cancelled.
 */
function TransactionForm({ onSave, initialData = null, onCancel, onWalletsChanged }) {
  const { user, loading: authLoading } = useAuth(); // Get authenticated user and loading state from context
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(false);

  // Predefined categories for selection
  const expenseCategories = ['Food', 'Transport', 'Utilities', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other Expense'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other Income'];

  // Effect to populate form fields when initialData (for editing) changes
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount);
      setType(initialData.type);
      setCategory(initialData.category);
      // Format date to YYYY-MM-DD for input type="date"
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
    } else {
      // Reset form fields for a new transaction
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]); // Default to today's date
    }
    setError(''); // Clear any previous errors
    setIsSubmitting(false); // Reset submission state
  }, [initialData]);

  useEffect(() => {
    const loadWallets = async () => {
      setLoadingWallets(true);
      try {
        const { data } = await getWallets();
        setWallets(data || []);
        if (initialData && initialData.walletId) {
          setWalletId(initialData.walletId);
        } else {
          setWalletId((data && data[0]?._id) || '');
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingWallets(false);
      }
    };
    loadWallets();
  }, [initialData]);

  const refreshWalletsAndSelect = async (newId) => {
    try {
      const { data } = await getWallets();
      setWallets(data || []);
      if (newId) setWalletId(newId);
      else if (!walletId && data && data[0]?._id) setWalletId(data[0]._id);
    } catch {}
    // Notify parent (Dashboard) so its wallets section refreshes
    if (onWalletsChanged) {
      onWalletsChanged(newId || null);
    }
  };

  // Quick add wallet presets
  const handleQuickAddWallet = async (preset) => {
    try {
      const payload = {
        name: preset, // Visible name, e.g., 'UPI', 'Cash', 'Card'
        type: preset.toLowerCase() === 'cash' ? 'cash' : preset.toLowerCase() === 'card' ? 'card' : 'bank',
        balance: 0,
      };
      const { data } = await createWallet(payload);
      toast.success(`${preset} wallet created`);
      await refreshWalletsAndSelect(data?._id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create wallet';
      toast.error(msg);
    }
  };

  // Handles form submission with proper error handling and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true); // Set submitting state to prevent double submission

    try {
      // Check if user is authenticated and auth loading is complete
      if (authLoading) {
        throw new Error('Authentication is still loading. Please wait and try again.');
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Enhanced form validation
      if (!description.trim()) {
        throw new Error('Description is required.');
      }
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error('Amount must be a positive number.');
      }
      if (!type) {
        throw new Error('Transaction type is required.');
      }
      if (!category) {
        throw new Error('Category is required.');
      }
      if (!date) {
        throw new Error('Date is required.');
      }

      // Validate date is not in the future
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (selectedDate > today) {
        throw new Error('Date cannot be in the future.');
      }

      // Prepare transaction data with proper formatting
      // CRITICAL FIX: The backend now gets the user ID from the Firebase token,
      // so we do NOT include it here.
      const transactionData = {
        description: description.trim(),
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        type,
        category,
        date: new Date(date).toISOString(),
        walletId,
      };

      await onSave(transactionData);

      if (!initialData) {
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        // Keep walletId selection
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while saving the transaction.';
      setError(errorMessage);
      console.error('Transaction form error:', err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
  };

  const categoriesToShow = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Transaction Type *
        </label>
        <div className="flex space-x-4">
          <label className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
            type === 'income' 
              ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          }`}>
            <input
              type="radio"
              name="transactionType"
              value="income"
              checked={type === 'income'}
              onChange={() => handleTypeChange('income')}
              className="form-radio text-green-600"
              disabled={isSubmitting || authLoading}
            />
            <TrendingUp size={20} />
            <span>Income</span>
          </label>
          <label className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
            type === 'expense' 
              ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          }`}>
            <input
              type="radio"
              name="transactionType"
              value="expense"
              checked={type === 'expense'}
              onChange={() => handleTypeChange('expense')}
              className="form-radio text-red-600"
              disabled={isSubmitting || authLoading}
            />
            <TrendingDown size={20} />
            <span>Expense</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <div className="relative">
          <FileText size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            id="description"
            className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting || authLoading}
            placeholder="Enter transaction description"
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount *
        </label>
        <div className="relative">
          <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="number"
            id="amount"
            className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            disabled={isSubmitting || authLoading}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Wallet Selection */}
      <div>
        <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wallet *
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <select
              id="wallet"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
              disabled={isSubmitting || authLoading || loadingWallets}
            >
              <option value="" disabled>{loadingWallets ? 'Loading wallets...' : 'Select a wallet'}</option>
              {wallets.map((w) => (
                <option key={w._id} value={w._id}>{w.name} (${Number(w.balance||0).toFixed(2)})</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border"
            onClick={() => setIsWalletModalOpen(true)}
            disabled={isSubmitting || authLoading}
          >
            Add Wallet
          </button>
        </div>
        {wallets.length === 0 && !loadingWallets && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            No wallets yet. Quick add: {' '}
            <button type="button" onClick={() => handleQuickAddWallet('Cash')} className="underline mr-2">Cash</button>
            <button type="button" onClick={() => handleQuickAddWallet('Card')} className="underline mr-2">Card</button>
            <button type="button" onClick={() => handleQuickAddWallet('UPI')} className="underline mr-2">UPI</button>
            or {' '}
            <button type="button" onClick={() => setIsWalletModalOpen(true)} className="underline">create custom</button>.
          </div>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category *
        </label>
        <div className="relative">
          <Tag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <select
            id="category"
            className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={isSubmitting || authLoading}
          >
            <option value="">Select a category</option>
            {categoriesToShow.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date *
        </label>
        <div className="relative">
          <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="date"
            id="date"
            className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isSubmitting || authLoading}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50"
          disabled={isSubmitting || authLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{initialData ? 'Update Transaction' : 'Add Transaction'}</span>
        </button>
      </div>
    </form>
    /* Wallet create modal */
    <WalletModal
      isOpen={isWalletModalOpen}
      onClose={() => setIsWalletModalOpen(false)}
      mode="create"
      onSubmit={async (payload) => {
        try {
          const { data } = await createWallet(payload);
          toast.success('Wallet created');
          setIsWalletModalOpen(false);
          await refreshWalletsAndSelect(data?._id);
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to create wallet';
          toast.error(msg);
        }
      }}
    />
    </>
  );
}

export default TransactionForm;
