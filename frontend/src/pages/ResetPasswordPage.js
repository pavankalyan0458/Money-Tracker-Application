// frontend/src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';


/**
 * ResetPasswordPage component handles the password reset process.
 * It extracts a token from the URL and allows the user to set a new password.
 */
function ResetPasswordPage() {
  const [searchParams] = useSearchParams(); // Hook to get URL query parameters
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');

  // Get the token from the URL
  const token = searchParams.get('token');

  useEffect(() => {
    // Initial check for token presence
    if (!token) {
      setResetStatus('error');
      setMessage('No reset token found in the URL. Please ensure you clicked the full link from your email.');
      toast.error('Password reset failed: No token provided.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      toast.error('Missing reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Send the new password and token to the backend
      const response = await api.put(`/auth/resetpassword/${token}`, { password });
      setResetStatus('success');
      setMessage(response.data.message || 'Your password has been successfully reset!');
      toast.success(response.data.message || 'Password reset successful!');
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setResetStatus('error');
      const errorMessage = err.response?.data?.message || 'Password reset failed. Invalid or expired token, or server error.';
      setError(errorMessage);
      setMessage(errorMessage);
      toast.error(errorMessage);
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Reset Password
        </h2>
        {resetStatus === 'pending' && token && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Enter your new password below.
          </p>
        )}
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100 text-sm">
            {error}
          </p>
        )}
        {resetStatus === 'success' && (
          <div className="text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Go to Login
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        )}
        {resetStatus === 'error' && (
          <div className="text-center">
            <XCircle size={64} className="text-red-500 mx-auto mb-6" />
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Request New Link
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        )}

        {/* Show form only if token is present and status is pending */}
        {resetStatus === 'pending' && token && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="pl-10 pr-10 shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="pl-10 pr-10 shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              <span>Reset Password</span>
            </button>
          </form>
        )}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          <Link to="/login" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold flex items-center justify-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
