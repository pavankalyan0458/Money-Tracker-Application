// frontend/src/utils/helpers.js
import { format } from 'date-fns'; // Import format function from date-fns for advanced date formatting

/**
 * Formats a date string or Date object into a readable DD/MM/YYYY format.
 * @param {string | Date} dateInput - The date to format.
 * @returns {string} The formatted date string (e.g., "22/07/2025").
 */
export const formatToDDMMYYYY = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return format(date, 'dd/MM/yyyy');
};

/**
 * Formats a number as a currency string.
 * @param {number} amount - The numeric amount to format.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 * @param {string} locale - The locale string (e.g., 'en-US', 'en-GB').
 * @returns {string} The formatted currency string (e.g., "$1,234.56" or "€1.234,56").
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Optional: A map for category labels or colors.
 * This can be expanded to include more categories and their specific styles.
 */
export const categoryLabelMap = {
  Food: { color: 'bg-red-200 text-red-800', icon: '🍔' },
  Transport: { color: 'bg-blue-200 text-blue-800', icon: '🚗' },
  Utilities: { color: 'bg-yellow-200 text-yellow-800', icon: '💡' },
  Salary: { color: 'bg-green-200 text-green-800', icon: '💸' },
  Entertainment: { color: 'bg-purple-200 text-purple-800', icon: '🎬' },
  // Add more categories as needed
  Default: { color: 'bg-gray-200 text-gray-800', icon: '🏷️' },
};

/**
 * Gets the style and icon for a given category.
 * @param {string} category - The category name.
 * @returns {object} An object containing color and icon for the category.
 */
export const getCategoryStyle = (category) => {
  return categoryLabelMap[category] || categoryLabelMap.Default;
};
