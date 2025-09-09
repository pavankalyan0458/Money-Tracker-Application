// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Frown, ArrowRight } from 'lucide-react'; // Icon

/**
 * 404 Not Found Page component with updated styling.
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-4">
      <Frown size={80} className="text-purple-600 dark:text-purple-400 mb-6" />
      <h1 className="text-6xl font-extrabold text-purple-600 dark:text-purple-400 mb-4">404</h1>
      <p className="text-2xl font-semibold mb-8 text-center">Page Not Found</p>
      <p className="text-lg text-center mb-10 max-w-md">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
      >
        <span>Go to Homepage</span>
        <ArrowRight size={20} />
      </Link>
    </div>
  );
}

export default NotFoundPage;
