// frontend/src/components/TransactionList.js
import React from 'react';
import { format } from 'date-fns'; // For convenient date formatting
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'; // Icons
import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Component to display a list of transactions in a table format.
 * @param {object} props - Component props.
 * @param {Array<object>} props.transactions - Array of transaction objects to display.
 * @param {function} props.onEdit - Callback function when the edit button is clicked for a transaction.
 * @param {function} props.onDelete - Callback function when the delete button is clicked for a transaction.
 */
function TransactionList({ transactions, onEdit, onDelete }) {
  const { formatAmount } = useCurrency();
  
  if (!transactions || transactions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions to display.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">Date</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {/* Format the date for display */}
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{transaction.description}</td>
              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{transaction.category}</td>
              <td className="py-3 px-4 whitespace-nowrap text-sm">
                {/* Apply different styles based on transaction type (income/expense) */}
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center space-x-1 ${
                  transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                }`}>
                  {transaction.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{transaction.type}</span>
                </span>
              </td>
              <td className={`py-3 px-4 whitespace-nowrap text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatAmount(transaction.amount)}
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center text-sm font-medium">
                {/* Edit button with SVG icon */}
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3 transition duration-200"
                  title="Edit Transaction"
                >
                  <Edit size={20} className="inline-block" />
                </button>
                {/* Delete button with SVG icon */}
                <button
                  onClick={() => onDelete(transaction._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition duration-200"
                  title="Delete Transaction"
                >
                  <Trash2 size={20} className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
