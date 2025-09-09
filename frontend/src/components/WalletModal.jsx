// frontend/src/components/WalletModal.jsx
import React, { useEffect, useState } from 'react';

/**
 * Reusable modal for creating/updating a wallet or transferring money.
 * Modes:
 * - mode === 'edit' | 'create' → wallet form (name, type, balance on create only)
 * - mode === 'transfer' → transfer form (fromWallet, toWallet, amount)
 */
function WalletModal({ isOpen, onClose, mode = 'create', onSubmit, initial, wallets = [] }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('0');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (mode !== 'transfer') {
      setName(initial?.name || '');
      setType(initial?.type || 'cash');
      setBalance(initial?.balance != null ? String(initial.balance) : '0');
    } else {
      setFromWalletId('');
      setToWalletId('');
      setAmount('');
    }
  }, [mode, initial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'transfer') {
      onSubmit({ fromWalletId, toWalletId, amount: Number(amount) });
    } else {
      const payload = { name: name.trim(), type };
      if (mode === 'create') {
        payload.balance = Number(balance) || 0;
      }
      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {mode === 'transfer' ? 'Transfer Money' : initial ? 'Edit Wallet' : 'Add Wallet'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'transfer' ? (
            <>
              <div>
                <label className="block text-sm mb-1">From Wallet</label>
                <select
                  className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900"
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  required
                >
                  <option value="">Select wallet</option>
                  {wallets.map((w) => (
                    <option key={w._id} value={w._id}>{w.name} (${Number(w.balance||0).toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">To Wallet</label>
                <select
                  className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900"
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  required
                >
                  <option value="">Select wallet</option>
                  {wallets.map((w) => (
                    <option key={w._id} value={w._id}>{w.name} (${Number(w.balance||0).toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Type</label>
                <select
                  className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900 capitalize"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="cash">cash</option>
                  <option value="bank">bank</option>
                  <option value="card">card</option>
                  <option value="crypto">crypto</option>
                </select>
              </div>
              {mode === 'create' && (
                <div>
                  <label className="block text-sm mb-1">Initial Balance</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border rounded-lg p-2 bg-white dark:bg-gray-900"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white">
              {mode === 'transfer' ? 'Transfer' : initial ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalletModal;


