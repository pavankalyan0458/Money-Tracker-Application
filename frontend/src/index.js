// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Main React application component
import './index.css'; // Global CSS file (for Tailwind CSS imports and custom styles)

// Create a React root and render the App component into the DOM element with id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Render the main App component */}
  </React.StrictMode>
);
