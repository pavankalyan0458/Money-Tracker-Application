// frontend/src/pages/WalletsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { getWallets, createWallet, updateWallet, deleteWallet, transferWallet } from '../api/api';
import WalletCard from '../components/WalletCard';
import WalletModal from '../components/WalletModal';
import { toast } from 'react-hot-toast';
import { PlusCircle, ArrowLeftRight } from 'lucide-react';

function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'transfer'
  const [selected, setSelected] = useState(null);

  const fetchWallets = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getWallets();
      setWallets(data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch wallets';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const totalBalance = useMemo(() => wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0), [wallets]);

  const openCreate = () => { setModalMode('create'); setSelected(null); setIsModalOpen(true); };
  const openEdit = (w) => { setModalMode('edit'); setSelected(w); setIsModalOpen(true); };
  const openTransfer = () => { setModalMode('transfer'); setSelected(null); setIsModalOpen(true); };

  const handleSubmit = async (payload) => {
    try {
      if (modalMode === 'transfer') {
        await transferWallet(payload);
        toast.success('Transfer completed');
      } else if (selected) {
        await updateWallet(selected._id, { name: payload.name, type: payload.type });
        toast.success('Wallet updated');
      } else {
        await createWallet(payload);
        toast.success('Wallet created');
      }
      setIsModalOpen(false);
      await fetchWallets();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (walletId) => {
    if (!window.confirm('Delete this wallet? This cannot be undone.')) return;
    try {
      await deleteWallet(walletId);
      toast.success('Wallet deleted');
      await fetchWallets();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Wallets</h1>
        <div className="flex gap-3">
          <button onClick={openTransfer} className="flex items-center gap-2 px-4 py-2 rounded-lg border">
            <ArrowLeftRight size={18} /> Transfer
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white">
            <PlusCircle size={18} /> Add Wallet
          </button>
        </div>
      </div>

      <div className="mb-4 text-gray-600 dark:text-gray-300">Total Balance: <span className="font-semibold">${totalBalance.toFixed(2)}</span></div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No wallets yet. Create your first wallet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <div key={w._id} className="space-y-3">
              <WalletCard wallet={w} />
              <div className="flex gap-2">
                <button onClick={() => openEdit(w)} className="px-3 py-2 rounded border">Edit</button>
                <button onClick={() => handleDelete(w._id)} className="px-3 py-2 rounded border border-red-300 text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSubmit={handleSubmit}
        initial={selected}
        wallets={wallets}
      />
    </div>
  );
}

export default WalletsPage;


