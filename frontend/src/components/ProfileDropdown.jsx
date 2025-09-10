// frontend/src/components/ProfileDropdown.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Upload, ImageOff, Lock, ShieldCheck, Globe2, CreditCard, Sun, Moon, User } from 'lucide-react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { uploadProfilePhoto, removeProfilePhoto, getUserProfile, updateUserProfile, getTransactions, getWallets } from '../api/api';
import { processImageForUpload, createImagePreview, revokeImagePreview } from '../utils/imageUtils';

const currencies = [
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'INR', label: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', label: 'Pound Sterling', flag: '🇬🇧' },
  { code: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
];

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('twoFactorEnabled') === 'true');
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({ totalTransactionsMonth: 0, totalBalance: 0 });
  const fileRef = useRef(null);
  const dropdownRef = useRef(null);
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem('twoFactorEnabled', String(twoFactorEnabled));
  }, [twoFactorEnabled]);

  // Load user profile when component mounts
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user?.uid]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Load user profile from MongoDB
  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    setLoadingProfile(true);
    try {
      const response = await getUserProfile(user.uid);
      setUserProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Don't show error toast for profile loading failures
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load personal stats when dropdown opens
  useEffect(() => {
    if (!open) return;
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const [txRes, walletsRes] = await Promise.all([
          getTransactions(),
          getWallets().catch(() => ({ data: [] })),
        ]);

        const transactions = Array.isArray(txRes.data) ? txRes.data : [];
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const totalTransactionsMonth = transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year;
        }).length;

        const wallets = Array.isArray(walletsRes.data) ? walletsRes.data : [];
        const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

        setStats({ totalTransactionsMonth, totalBalance });
      } catch (e) {
        setStats({ totalTransactionsMonth: 0, totalBalance: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [open]);

  const containerVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } },
  };

  const glowRing = theme === 'dark' ? 'shadow-[0_0_30px_rgba(147,51,234,0.4)]' : 'shadow-[0_0_30px_rgba(99,102,241,0.35)]';

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      console.log('Starting photo upload for user:', user?.uid);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      // Process the image (validate, compress if needed, convert to Base64)
      const base64String = await processImageForUpload(file, 1); // 1MB max
      console.log('Image processed successfully');
      
      // Upload to MongoDB
      const response = await uploadProfilePhoto(base64String, user.uid);
      console.log('Upload response:', response.data);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        profilePhoto: base64String
      }));
      
      toast.success('Profile photo updated successfully!');
      setOpen(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  };

  // Handle photo removal
  const handlePhotoRemove = async () => {
    // Check if user actually has a photo to remove
    if (!userProfile?.profilePhoto) {
      toast.error('No photo to remove');
      return;
    }

    try {
      console.log('Removing photo for user:', user?.uid);
      
      // Remove from MongoDB
      await removeProfilePhoto(user.uid);
      console.log('Photo removed from database');
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        profilePhoto: null
      }));
      
      toast.success('Profile photo removed successfully!');
      setOpen(false);
      
    } catch (error) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove photo. Please try again.');
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email. Please try again.');
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
  };

  // Test MongoDB connection
  const testMongoConnection = async () => {
    try {
      console.log('Testing MongoDB connection...');
      toast.loading('Testing MongoDB connection...', { id: 'mongo-test' });
      
      // Test by trying to get user profile
      const response = await getUserProfile(user.uid);
      console.log('MongoDB connection successful:', response.data);
      
      toast.success('MongoDB connection successful!', { id: 'mongo-test' });
      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      
      let errorMessage = 'MongoDB connection failed';
      if (error.response?.status === 404) {
        errorMessage = 'User not found in database.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Check internet connection.';
      } else {
        errorMessage = `Database error: ${error.message || 'Unknown error'}`;
      }
      
      toast.error(errorMessage, { id: 'mongo-test' });
      return false;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen((o) => !o)} className="group flex items-center gap-2 text-white/90 hover:text-white">
        <div className={`relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/30 ${glowRing} transition-shadow`}> 
          {userProfile?.profilePhoto ? (
            <img src={userProfile.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 bg-white/90 text-gray-800 rounded-full p-0.5 shadow group-hover:scale-105 transition-transform">
            <Upload size={12} />
          </div>
        </div>
        <span className="hidden md:inline font-semibold drop-shadow-sm">{user.displayName || 'Profile'}</span>
        <ChevronDown size={16} className="opacity-80" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="absolute right-0 mt-3 w-[22rem] max-w-[92vw] backdrop-blur-xl bg-white/30 dark:bg-gray-800/40 border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-white/60 to-white/20 dark:from-gray-900/60 dark:to-gray-800/30">
              <div className="flex items-center gap-3">
                <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/50 ${glowRing}`}>
                  {userProfile?.profilePhoto ? (
                    <img src={userProfile.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <User size={28} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm opacity-80">{user.email}</div>
                  <input
                    className="w-full bg-transparent border-b border-white/40 dark:border-white/20 focus:outline-none text-gray-800 dark:text-gray-100 placeholder-white/60 text-lg"
                    defaultValue={userProfile?.displayName || user.displayName || ''}
                    placeholder="Display name"
                    onBlur={async (e) => { 
                      try { 
                        await updateUserProfile(user.uid, { displayName: e.target.value });
                        setUserProfile(prev => ({ ...prev, displayName: e.target.value }));
                      } catch (error) {
                        console.error('Failed to update display name:', error);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <button 
                  onClick={() => fileRef.current?.click()} 
                  disabled={uploading}
                  className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 shadow disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Upload size={16} />
                    <span>{uploading ? 'Uploading...' : t('uploadPhoto')}</span>
                  </div>
                </button>
                <button 
                  onClick={handlePhotoRemove} 
                  className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 shadow"
                >
                  <div className="flex items-center gap-2"><ImageOff size={16} /><span>{t('removePhoto')}</span></div>
                </button>
              </div>
            </div>

            <div className="p-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/60 dark:bg-white/10 p-3 shadow hover:shadow-lg transition">
                  <div className="text-xs opacity-70 mb-2 flex items-center gap-2"><CreditCard size={14} /> {t('currency')}</div>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-transparent border border-white/50 dark:border-white/20 rounded-xl p-2">
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl bg-white/60 dark:bg-white/10 p-3 shadow hover:shadow-lg transition">
                  <div className="text-xs opacity-70 mb-2 flex items-center gap-2"><Globe2 size={14} /> {t('language')}</div>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-transparent border border-white/50 dark:border-white/20 rounded-xl p-2">
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-white/60 dark:bg-white/10 p-3 shadow hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center gap-2"><Sun size={16} className="text-amber-500" /> {t('theme')}</div>
                  <button onClick={toggleTheme} className="relative inline-flex items-center h-9 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-gray-700 dark:to-gray-900 shadow-inner">
                    <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute h-7 w-7 bg-white rounded-full shadow -left-1" style={{ left: theme === 'light' ? '2px' : 'calc(100% - 30px)' }} />
                    <div className="flex justify-between w-full px-2 text-white">
                      <Sun size={16} />
                      <Moon size={16} />
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white/60 dark:bg-white/10 p-3 shadow hover:shadow-lg transition">
                <div className="text-sm font-medium flex items-center gap-2 mb-2"><ShieldCheck size={16} /> {t('security')}</div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleChangePassword}
                    className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 shadow flex items-center gap-2"
                  >
                    <Lock size={16} /> {t('changePassword')}
                  </button>
                  <button 
                    onClick={handle2FAToggle} 
                    className={`px-3 py-2 rounded-xl shadow flex items-center gap-2 ${twoFactorEnabled ? 'bg-green-500 text-white' : 'bg-white/80 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-white/20'}`}
                  >
                    <ShieldCheck size={16} /> {twoFactorEnabled ? t('disable2FA') : t('enable2FA')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/70 dark:bg-white/10 p-3 shadow">
                  <div className="text-[10px] opacity-60">{t('totalTransactions')}</div>
                  <div className="text-lg font-bold">{statsLoading ? '…' : stats.totalTransactionsMonth}</div>
                </div>
                <div className="rounded-2xl bg-white/70 dark:bg-white/10 p-3 shadow">
                  <div className="text-[10px] opacity-60">{t('totalBalance')}</div>
                  <div className="text-lg font-bold">{statsLoading ? '…' : formatAmount(stats.totalBalance)}</div>
                </div>
                <div className="rounded-2xl bg-white/70 dark:bg-white/10 p-3 shadow">
                  <div className="text-[10px] opacity-60">{t('lastLogin')}</div>
                  <div className="text-[12px] font-medium">{new Date(auth.currentUser?.metadata?.lastSignInTime || Date.now()).toLocaleString()}</div>
                </div>
              </div>

              <button onClick={onLogout} className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl">
                <LogOut size={18} /> {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


