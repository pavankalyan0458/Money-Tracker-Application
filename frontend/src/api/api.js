import axios from 'axios';
import { auth } from '../firebase'; // Import the Firebase auth object

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// A request interceptor to add the Firebase auth token to the headers
API.interceptors.request.use(async (config) => {
  // Check if a user is currently logged in
  const user = auth.currentUser;
  
  if (user) {
    try {
      // Get the Firebase ID token from the current user
      const token = await user.getIdToken();
      // Attach the token to the 'Authorization' header in the correct format
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  }

  // Always return the configuration object, even if a user is not logged in
  return config;
}, (error) => {
  // Handle any request errors
  return Promise.reject(error);
});

// We can still export the API functions for clarity
export const getTransactions = () => API.get('/transactions');
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Wallet APIs
export const getWallets = () => API.get('/wallets');
export const createWallet = (data) => API.post('/wallets', data);
export const updateWallet = (id, data) => API.put(`/wallets/${id}`, data);
export const deleteWallet = (id) => API.delete(`/wallets/${id}`);
export const transferWallet = (payload) => API.post('/wallets/transfer', payload);

export default API;
