// frontend/src/components/Navbar.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import ProfileDropdown from './ProfileDropdown';

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

        {/* Right: Profile/Login */}
        <div className="flex items-center space-x-4 ml-auto">
          {user ? (
            // Profile dropdown
            <div className="relative">
              <ProfileDropdown user={user} onLogout={handleLogout} />
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
