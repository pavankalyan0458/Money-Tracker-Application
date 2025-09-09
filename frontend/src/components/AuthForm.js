// frontend/src/components/AuthForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; // For the Google icon
import toast from 'react-hot-toast'; // Import react-hot-toast

/**
 * Reusable authentication form component for both Login and Register.
 * @param {object} props - Component props.
 * @param {string} props.mode - 'login' or 'register' to determine form behavior.
 * @param {function} props.onEmailSubmit - Function to call for email/password submission.
 * @param {function} props.onGoogleSubmit - Function to call for Google login.
 * @param {string} props.error - Error message to display.
 * @param {boolean} props.loading - Loading state to disable form.
 */
function AuthForm({ mode, onEmailSubmit, onGoogleSubmit, error, loading }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handles form submission based on the mode (login or register)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register') {
      onEmailSubmit(username, email, password);
    } else {
      onEmailSubmit(email, password);
    }
  };

  // Handles Google login button click
  const handleGoogleLogin = () => {
    onGoogleSubmit();
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>
        {error && (
          // Display error message if present
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </p>
        )}
        
        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:bg-gray-100"
          disabled={loading}
        >
          <FcGoogle className="h-6 w-6 mr-3" />
          Sign {mode === 'login' ? 'in' : 'up'} with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="JohnDoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {mode === 'login' && (
            <div className="text-right text-sm">
              <Link to="/forgot-password" className="font-semibold text-purple-600 hover:text-purple-800">
                Forgot password?
              </Link>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link
            to={mode === 'login' ? '/register' : '/login'}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
