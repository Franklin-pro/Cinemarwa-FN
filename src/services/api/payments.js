// services/api/payments.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const paymentsAxios = axios.create({
  baseURL: `${API_URL}/payments`,
});

// Add token to requests
paymentsAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentsService = {
  // ====== PAYMENT ENDPOINTS ======
  
  // Process MoMo Payment (with automatic withdrawals)
  processMoMoPayment: (paymentData) =>
    paymentsAxios.post('/momo', paymentData),
  
  // Check MoMo payment status
  checkMoMoPaymentStatus: (transactionId) =>
    paymentsAxios.get(`/momo/status/${transactionId}`),
  
  // Process Stripe Payment
  processStripePayment: (paymentData) =>
    paymentsAxios.post('/stripe', paymentData),
  
  processSubscriptionMomoPayment: (paymentData) =>
    paymentsAxios.post('/subscription/momo', paymentData),
  processSubscriptionStripePayment: (paymentData) =>
    paymentsAxios.post('/subscription/stripe', paymentData),
  // Get payment details
  getPaymentDetails: (paymentId) =>
    paymentsAxios.get(`/status/${paymentId}`),
  
  // Get user's payment history
  getPaymentHistory: (userId, params = {}) =>
    paymentsAxios.get(`/user/${userId}`, { params }),
  
  // Confirm payment (manual - admin only)
  confirmPayment: (paymentId, status) =>
    paymentsAxios.patch(`/${paymentId}/confirm`, { status }),
  
  // Get movie analytics (filmmaker/admin)
  getMovieAnalytics: (movieId) =>
    paymentsAxios.get(`/movie/${movieId}/analytics`),
  
  // ====== WITHDRAWAL ENDPOINTS ======
  
  // Get user's withdrawal history
  getWithdrawalHistory: (userId, params = {}) =>
    paymentsAxios.get(`/withdrawals/user/${userId}`, { params }),
  
  // Get withdrawal details
  getWithdrawalDetails: (withdrawalId) =>
    paymentsAxios.get(`/withdrawals/${withdrawalId}`),
  
  // ====== LEGACY/ADDITIONAL ENDPOINTS ======
  
  // Purchase Management (if you have separate endpoints)
  purchaseMovie: (movieId, type, paymentMethod = 'momo', paymentData = {}) =>
    paymentsAxios.post('/purchase', { movieId, type, paymentMethod, ...paymentData }),
  
  // Download movie (if separate from purchase)
  downloadMovie: (movieId) =>
    paymentsAxios.post(`/download/${movieId}`),
  
  // Filmmaker Revenue (if you have these endpoints)
  getRevenue: (params) => 
    paymentsAxios.get('/revenue', { params }),
  
  // Manual withdrawal request (if needed)
  withdrawRevenue: (amount, phoneNumber) =>
    paymentsAxios.post('/withdraw', { amount, phoneNumber }),
  
  // Delete payment history (admin)
  deleteHistory: (transactionId) =>
    paymentsAxios.delete(`/transaction/${transactionId}`),
  
  // Get revenue history
  getRevenueHistory: () =>
    paymentsAxios.get('/revenue-history'),
};