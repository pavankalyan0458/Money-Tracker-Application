    // frontend/src/contexts/ThemeContext.js
    import React, { createContext, useState, useEffect, useContext } from 'react';

    // Create the ThemeContext
    export const ThemeContext = createContext();

    /**
     * ThemeProvider component that wraps the application to provide theme context.
     * It manages the current theme ('light' or 'dark') and persists it in localStorage.
     */
    export const ThemeProvider = ({ children }) => {
      // Initialize theme state from localStorage or default to 'light'
      const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme : 'light';
      });

      // Effect to apply the theme class to the documentElement (html tag)
      useEffect(() => {
        const root = window.document.documentElement;
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        // Add the current theme class
        root.classList.add(theme);
        // Save the current theme to localStorage
        localStorage.setItem('theme', theme);
      }, [theme]); // Re-run effect whenever theme changes

      // Function to toggle between 'light' and 'dark' themes
      const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      };

      return (
        // Provide theme state and toggle function to all children components
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      );
    };

    // Custom hook to easily consume the theme context
    export const useTheme = () => useContext(ThemeContext);
    