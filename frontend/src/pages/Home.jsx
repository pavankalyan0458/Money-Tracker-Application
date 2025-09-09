// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold">Welcome to Money Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your income, expenses and wallets. Gain insights with clean charts and reports.</p>
        <div className="flex justify-center gap-3">
          <Link to="/dashboard" className="px-5 py-3 rounded-lg bg-purple-600 text-white">Go to Dashboard</Link>
          <Link to="/wallets" className="px-5 py-3 rounded-lg border">Manage Wallets</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>Add a transaction</li>
            <li>Create a new wallet</li>
            <li>View monthly report</li>
          </ul>
        </div>
        <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
          <h3 className="font-semibold mb-2">Highlights</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">See spending trends and income growth at a glance on the Dashboard.</p>
        </div>
        <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
          <h3 className="font-semibold mb-2">AI Assistant (Coming Soon)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Chat with an assistant to categorize expenses and suggest budgets.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;


