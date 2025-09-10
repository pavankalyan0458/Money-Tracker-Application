// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // Dashboard page component
import LoginPage from './pages/LoginPage'; // Login page component
import RegisterPage from './pages/RegisterPage'; // Register page component
import NotFoundPage from './pages/NotFoundPage'; // 404 Not Found page component
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Forgot Password page
import ResetPasswordPage from './pages/ResetPasswordPage'; // Reset Password page
import Navbar from './components/Navbar'; // Navigation bar component
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Authentication context provider
import { ThemeProvider } from './contexts/ThemeContext'; // Theme context provider
import { Toaster } from 'react-hot-toast'; // For toast notifications
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import WalletsPage from './pages/WalletsPage.jsx';
import Home from './pages/Home.jsx';
import Transactions from './pages/Transactions.jsx';
import Reports from './pages/Reports.jsx';

/**
 * Protected Route component that redirects users based on authentication status
 * @param {object} props - Component props
 * @param {boolean} props.requireAuth - Whether the route requires authentication
 * @param {React.ReactNode} props.children - The component to render
 * @param {string} props.redirectTo - Where to redirect if conditions aren't met
 */
const ProtectedRoute = ({ requireAuth, children, redirectTo }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If route requires auth and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If route is for guests only (login/register) and user is logged in, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component
  return children;
};

/**
 * Main App component that sets up routing and context providers
 */
function AppContent() {
  return (
    <Router>
      {/* The main container for the application, applies background color based on theme */}
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
        <Navbar /> {/* Navigation bar, visible on all pages */}
        <main className="flex-grow container mx-auto p-4">
          {/* Define application routes with proper protection */}
          <Routes>
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Home />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <WalletsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            {/* Guest-only routes: Login/Register redirect to dashboard if already authenticated */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/">
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/">
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Guest-only routes: Password reset pages */}
            <Route 
              path="/forgot-password" 
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/">
                  <ForgotPasswordPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reset-password" 
              element={
                <ProtectedRoute requireAuth={false} redirectTo="/">
                  <ResetPasswordPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Toaster /> {/* Toast notification container */}
      </div>
    </Router>
  );
}

/**
 * The main application component.
 * Sets up routing for different pages and provides the authentication and theme contexts.
 */
function App() {
  return (
    // ThemeProvider wraps AuthProvider to ensure theme is available before auth state
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          {/* AuthProvider wraps the entire application to make authentication context available globally */}
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;