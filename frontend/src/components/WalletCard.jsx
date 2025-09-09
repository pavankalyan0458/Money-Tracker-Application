// frontend/src/components/WalletCard.jsx
import React from 'react';

/**
 * Display a single wallet with name, type, and balance.
 * - selected: highlights the card when it's the active filter
 * - onClick: selects the wallet for filtering
 */
function WalletCard({ wallet, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl shadow border transition-colors ${
        selected
          ? 'bg-purple-600 text-white border-purple-700'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-80 capitalize">{wallet.type || 'cash'}</div>
          <div className="text-lg font-semibold">{wallet.name}</div>
        </div>
        <div className="text-xl font-bold">
          ${Number(wallet.balance || 0).toFixed(2)}
        </div>
      </div>
    </button>
  );
}

export default WalletCard;


