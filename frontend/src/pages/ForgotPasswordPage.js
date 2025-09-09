// frontend/src/pages/ForgotPasswordPage.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Corrected import: toast is a named export
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

/**
 * Forgot Password Page component.
 * Allows users to request a password reset. (Placeholder for full functionality)
 */
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Use the new Firebase function from the AuthContext
  const { sendPasswordResetEmailToUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmailToUser(email);

      // We use a generic success message for security reasons
      setMessage('If an account with that email exists, a password reset link has been sent.');
      toast.success('Password reset email sent!');

    } catch (err) {
      console.error('Password reset error:', err);
      // Firebase auth errors have a 'code' and 'message'
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (err.code) {
        // You can customize error messages based on Firebase error codes
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with that email.';
            break;
          default:
            errorMessage = err.message || 'Failed to send reset email.';
            break;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Enter your email address to receive a password reset link.
        </p>
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 dark:bg-green-900 dark:text-green-100 text-sm">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                id="email"
                className="pl-10 shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            <span>Send Reset Link</span>
          </button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          <Link to="/login" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold flex items-center justify-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
