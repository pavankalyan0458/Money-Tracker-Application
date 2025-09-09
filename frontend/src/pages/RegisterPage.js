// frontend/src/pages/RegisterPage.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Updated to use the new Firebase functions from AuthContext
  const { registerWithEmail, signInWithGoogle } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password); // Use the new Firebase registration function
      toast.success('Registration successful! Welcome to Money Tracker App!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handles Google registration
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Google registration successful! Redirecting...');
      navigate('/');
    } catch (err) {
      console.error('Google registration error:', err);
      const errorMessage = err.message || 'Google registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">

        {/* Left Section */}
        <div className="relative md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 text-white p-8 flex flex-col justify-center items-center text-center py-16 md:py-24">
          <div className="absolute top-10 left-10 w-24 h-24 bg-white bg-opacity-15 rounded-full animate-pulse-slow shadow-xl"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-white bg-opacity-15 rounded-full animate-pulse-medium shadow-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white bg-opacity-15 rounded-full animate-pulse-fast shadow-xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse-slowest shadow-xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-white opacity-90 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="block text-3xl font-extrabold mt-4 drop-shadow-lg">Money Tracker</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">Welcome!</h1>
            <p className="text-lg opacity-90 mb-8 max-w-xs drop-shadow-md">Sign up to continue access</p>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 border border-white rounded-full text-white font-semibold hover:bg-white hover:text-purple-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Already have an account? Login
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Register</h2>

          {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JohnDoe"
                  className="pl-10 w-full border-b-2 border-gray-300 dark:border-gray-600 py-3 px-2 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none focus:border-purple-500 transition duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@example.com"
                  className="pl-10 w-full border-b-2 border-gray-300 dark:border-gray-600 py-3 px-2 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none focus:border-purple-500 transition duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="pl-10 pr-10 w-full border-b-2 border-gray-300 dark:border-gray-600 py-3 px-2 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none focus:border-purple-500 transition duration-200"
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
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              <span>REGISTER</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            or connect with Social Media
          </div>

          <div className="flex flex-col space-y-3 mt-4">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center space-x-2"
              onClick={handleGoogleRegister} // Call the new Google registration function
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 12.02c0-.75-.06-1.47-.18-2.18h-10.2v4.2h5.92c-.26 1.37-1.04 2.53-2.22 3.32v2.75h3.54c2.07-1.92 3.26-4.74 3.26-8.11z"/><path d="M12.02 22c3.27 0 6.01-1.08 8.01-2.92l-3.54-2.75c-.97.66-2.2.98-3.47.98-2.67 0-4.94-1.8-5.74-4.2H2.74v2.85C4.7 20.3 8.16 22 12.02 22z"/><path d="M6.28 14.52c-.2-.66-.31-1.37-.31-2.09s.11-1.43.31-2.09V7.58H2.74c-.62 1.25-.97 2.65-.97 4.09s.35 2.84.97 4.09l3.54-2.75z"/><path d="M12.02 5.5c1.78 0 3.36.62 4.62 1.83l3.14-3.14C18.03 2.56 15.29 1.5 12.02 1.5c-3.86 0-7.32 1.7-9.28 4.42l3.54 2.75c.8-2.4 3.07-4.2 5.74-4.2z"/></svg>
              <span>Sign Up With Google</span>
            </button>
            <button
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center space-x-2"
              onClick={() => toast.info('Facebook Sign-up placeholder.')}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.25 6 14.5 6c1.44 0 2.79.26 2.79.26V8.5h-1.88c-.93 0-1.19.58-1.19 1.18V12h3l-.48 3H15v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              <span>Sign Up With Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
