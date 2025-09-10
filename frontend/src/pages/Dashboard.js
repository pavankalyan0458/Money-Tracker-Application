// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Use the useAuth hook for authentication
import { useCurrency } from '../contexts/CurrencyContext'; // Use the useCurrency hook for currency formatting
import api, { getWallets } from '../api/api'; // Axios instance for API calls
import TransactionForm from '../components/TransactionForm'; // Form for adding/editing transactions
import TransactionList from '../components/TransactionList'; // Component to display transaction list
import SummaryCharts from '../components/SummaryCharts'; // Component to display charts
import Modal from '../components/Modal'; // Reusable modal component
import { toast } from 'react-hot-toast'; // Toast notifications
import { PlusCircle, Search, Filter, Mail, BarChart2, RefreshCw } from 'lucide-react'; // Icons
import WalletCard from '../components/WalletCard';

/**
 * The main dashboard page for the Money Tracker application.
 * CRITICAL FIX: Prevents infinite loop by properly managing authentication state.
 */
function Dashboard() {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state from useAuth hook
  const { formatAmount } = useCurrency(); // Get currency formatting function
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [transactions, setTransactions] = useState([]); // State to store user's transactions
  const [loading, setLoading] = useState(false); // State to manage loading status of transactions
  const [error, setError] = useState(''); // State to store error messages
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [currentTransaction, setCurrentTransaction] = useState(null); // State to hold the transaction being edited
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // Filter by month (YYYY-MM)
  const [filterCategory, setFilterCategory] = useState(''); // Filter by category
  const [searchTerm, setSearchTerm] = useState(''); // Search term for description
  const [refreshing, setRefreshing] = useState(false); // State for manual refresh
  const [wallets, setWallets] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(''); // empty means all wallets
  const [hasInitialized, setHasInitialized] = useState(false); // Track if we've done initial fetch

  // useCallback to memoize the fetchTransactions function, preventing unnecessary re-renders
  const fetchTransactions = useCallback(async () => {
    // CRITICAL FIX: Only fetch if user is authenticated AND auth loading is complete
    if (!user || authLoading) {
      console.log('🔄 Skipping fetchTransactions: user not ready or auth still loading');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching transactions for Firebase user:', user.uid);
      const response = await api.get('/transactions'); // Fetch transactions from the backend
      console.log('✅ Transactions response:', response.data);
      setTransactions(response.data || []); // Update transactions state with fallback to empty array
    } catch (err) {
      console.error('❌ Fetch transactions error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch transactions.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, [user, authLoading]); // CRITICAL FIX: Include authLoading in dependencies

  const fetchWallets = useCallback(async () => {
    if (!user || authLoading) return;
    try {
      const { data } = await getWallets();
      setWallets(data || []);
    } catch (e) {
      // ignore; dashboard still works
    }
  }, [user, authLoading]);

  // Manual refresh function with authentication check
  const handleRefresh = async () => {
    // CRITICAL FIX: Only refresh if user is authenticated
    if (!user || authLoading) {
      toast.error('Please wait for authentication to complete before refreshing.');
      return;
    }
    
    setRefreshing(true);
    await fetchTransactions();
    await fetchWallets();
    setRefreshing(false);
    toast.success('Transactions refreshed!');
  };

  // useEffect hook to handle authentication status and initial data fetch
  useEffect(() => {
    // CRITICAL FIX: Only proceed when authentication is completely finished
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return; // Wait for authentication to complete
    }
    
    if (!user) {
      // If authentication is complete and no user is logged in, redirect to login page
      console.log('❌ No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // CRITICAL FIX: Only fetch transactions once when user is first authenticated
    if (user && !hasInitialized) {
      console.log('✅ User authenticated, performing initial fetch');
      setHasInitialized(true); // Mark as initialized to prevent infinite loops
      fetchTransactions();
      fetchWallets();
    }
  }, [user, authLoading, navigate, fetchTransactions, fetchWallets, hasInitialized]); // Dependencies for this effect
  const handleWalletsChanged = async (newWalletId) => {
    await fetchWallets();
    if (newWalletId) {
      setActiveWalletId(newWalletId);
    }
  };


  // Handles saving (adding or updating) a transaction with authentication check
  const handleSaveTransaction = async (transactionData) => {
    // CRITICAL FIX: Verify authentication before proceeding
    if (!user || authLoading) {
      toast.error('Authentication not ready. Please try again.');
      return;
    }
    
    try {
      setError(''); // Clear any previous errors
      
      if (currentTransaction) {
        // If currentTransaction exists, it means we are editing an existing transaction
        console.log('✏️ Updating transaction:', currentTransaction._id, transactionData);
        await api.put(`/transactions/${currentTransaction._id}`, transactionData);
        toast.success('Transaction updated successfully!');
      } else {
        // Otherwise, we are adding a new transaction
        console.log('➕ Adding new transaction:', transactionData);
        await api.post('/transactions', transactionData);
        toast.success('Transaction added successfully!');
      }
      
      // Refresh the list of transactions after save
      await fetchTransactions();
      
      // Close the modal and reset state
      setIsModalOpen(false);
      setCurrentTransaction(null);
      
    } catch (err) {
      console.error('❌ Save transaction error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save transaction.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handles deleting a transaction with authentication check
  const handleDeleteTransaction = async (id) => {
    // CRITICAL FIX: Verify authentication before proceeding
    if (!user || authLoading) {
      toast.error('Authentication not ready. Please try again.');
      return;
    }
    
    // A simple window.confirm is used here. In a production app, you'd use a custom modal for better UX.
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        setError(''); // Clear any previous errors
        console.log('🗑️ Deleting transaction:', id);
        
        await api.delete(`/transactions/${id}`); // Send DELETE request to backend
        toast.success('Transaction deleted successfully!');
        
        // Refresh the list after deletion
        await fetchTransactions();
        
      } catch (err) {
        console.error('❌ Delete transaction error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to delete transaction.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // Sets the transaction to be edited and opens the modal
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  // Filters transactions based on the selected month, category, and search term
  const filteredTransactions = transactions.filter(transaction => {
    if (activeWalletId && transaction.walletId !== activeWalletId) return false;
    const transactionDate = new Date(transaction.date);
    const [filterYear, filterMonthNum] = filterMonth.split('-').map(Number); // Parse filter month/year

    // Check if the transaction's year and month match the filter
    const matchesMonth = transactionDate.getFullYear() === filterYear &&
                         (transactionDate.getMonth() + 1) === filterMonthNum;

    // Check if the transaction's category includes the filter category (case-insensitive)
    const matchesCategory = filterCategory === '' || 
                           transaction.category.toLowerCase().includes(filterCategory.toLowerCase());

    // Check if the transaction description includes the search term (case-insensitive)
    const matchesSearch = searchTerm === '' || 
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMonth && matchesCategory && matchesSearch;
  });

  // Calculate total income and expenses from the filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  // Display loading message while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Placeholder for Email Parsing
  const handleEmailParsing = () => {
    toast.info("Email parsing feature is a placeholder. Integration with Gmail API or similar would go here.");
  };

  // Placeholder for Power BI Integration
  const handlePowerBIIntegration = () => {
    toast.info("Power BI integration is a placeholder. You'd embed an iframe or link to a Power BI report here.");
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Your Financial Dashboard
      </h1>

      {/* Wallets section removed as requested */}

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 dark:bg-red-900 dark:text-red-100" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Summary Cards: Total Income, Total Expenses, Net Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Income (This Month)
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatAmount(totalIncome)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Expenses (This Month)
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatAmount(totalExpenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Net Balance (This Month)
          </h3>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatAmount(netBalance)}
          </p>
        </div>
      </div>

      {/* Action Buttons: Add Transaction, Email Parsing, Power BI, Refresh */}
      <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
        <button
          onClick={() => { setCurrentTransaction(null); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <PlusCircle size={20} />
          <span>Add New Transaction</span>
        </button>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing || !user || authLoading}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        
        <button
          onClick={handleEmailParsing}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Mail size={20} />
          <span>Parse Emails (Mock)</span>
        </button>
        
        <button
          onClick={handlePowerBIIntegration}
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <BarChart2 size={20} />
          <span>Power BI (Placeholder)</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <Filter size={20} />
          <span>Filter & Search:</span>
        </h3>
        <div className="flex-grow relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            id="searchTerm"
            placeholder="Search by description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex-grow">
          <label htmlFor="filterMonth" className="sr-only">Filter by Month</label>
          <input
            type="month"
            id="filterMonth"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex-grow">
          <label htmlFor="filterCategory" className="sr-only">Filter by Category</label>
          <input
            type="text"
            id="filterCategory"
            placeholder="Filter by Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Spending Insights</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading charts...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <SummaryCharts transactions={filteredTransactions} />
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No transactions for the selected filters to display charts.
          </p>
        )}
      </div>

      {/* Transaction List Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Transaction History
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {transactions.length === 0 
                ? 'No transactions found. Add your first transaction to get started!' 
                : 'No transactions found for the selected filters.'}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => { setCurrentTransaction(null); setIsModalOpen(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Add Your First Transaction
              </button>
            )}
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTransaction(null);
          setError('');
        }} 
        title={currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      >
        <TransactionForm
          onSave={handleSaveTransaction}
          initialData={currentTransaction}
          onWalletsChanged={handleWalletsChanged}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentTransaction(null);
            setError('');
          }}
        />
      </Modal>
    </div>
  );
}

export default Dashboard;