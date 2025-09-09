// frontend/src/components/Navbar.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { auth, storage, updateProfile } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Navigation bar component for the application.
 * Displays app title, and conditionally shows login links or user info/logout button.
 * Includes a theme toggle for light/dark mode.
 */
function Navbar() {
  const { user, logout } = useContext(AuthContext); // Access user and logout function from AuthContext
  const { theme, toggleTheme } = useTheme(); // Access theme state and toggle function
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);

  // Handles user logout and redirects to the login page
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 shadow-md dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Brand + Nav */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-white text-2xl font-bold tracking-wide flex items-center space-x-2">
            <span role="img" aria-label="money-bag">💰</span>
            <span>Money Tracker</span>
          </Link>
          {user && (
            <div className="hidden md:flex items-center space-x-4 text-white/90">
              <NavLink to="/" end className={({isActive}) => `hover:text-white ${isActive ? 'font-semibold' : ''}`}>Home</NavLink>
              <NavLink to="/dashboard" className={({isActive}) => `hover:text-white ${isActive ? 'font-semibold' : ''}`}>Dashboard</NavLink>
              <NavLink to="/wallets" className={({isActive}) => `hover:text-white ${isActive ? 'font-semibold' : ''}`}>Wallets</NavLink>
              <NavLink to="/transactions" className={({isActive}) => `hover:text-white ${isActive ? 'font-semibold' : ''}`}>Transactions</NavLink>
              <NavLink to="/reports" className={({isActive}) => `hover:text-white ${isActive ? 'font-semibold' : ''}`}>Reports</NavLink>
            </div>
          )}
        </div>

        {/* Right: Theme + Profile/Login */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            // Profile dropdown
            <div className="relative">
              <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-white/90 hover:text-white">
                <img src={user.photoURL || 'https://i.pravatar.cc/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="hidden md:inline">{user.displayName || 'Profile'}</span>
                <ChevronDown size={16} />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={user.photoURL || 'https://i.pravatar.cc/80'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <input
                        className="w-full bg-transparent border-b dark:border-gray-600 focus:outline-none text-gray-900 dark:text-gray-100"
                        defaultValue={user.displayName || ''}
                        placeholder="Display name"
                        onBlur={async (e) => { try { await updateProfile(auth.currentUser, { displayName: e.target.value }); } catch {} }}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        await updateProfile(auth.currentUser, { photoURL: url });
                        setOpen(false);
                      } catch {}
                    }} />
                    <button onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded border">Upload Photo</button>
                    <button onClick={async () => { try { await updateProfile(auth.currentUser, { photoURL: 'https://i.pravatar.cc/150?u=default' }); setOpen(false); } catch {} }} className="px-3 py-2 rounded border">Use Sticker</button>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">Theme</div>
                    <button onClick={toggleTheme} className="px-3 py-1 rounded border">{theme === 'light' ? 'Dark' : 'Light'}</button>
                  </div>
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">Settings (currency, language) — placeholder</div>
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // If no user is logged in, display only Login link (Register is on the Login/Register page itself)
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-purple-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out font-semibold flex items-center space-x-2"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
