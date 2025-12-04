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
  // MoMo Payment
  processMoMoPayment: (paymentData) =>
    paymentsAxios.post('/momo', paymentData),
  
  // Check MoMo payment status
  checkMoMoPaymentStatus: (transactionId) =>
    paymentsAxios.get(`/momo/status/${transactionId}`),

  // Payment History
  getPaymentHistory: (userId) =>
    paymentsAxios.get(`/user/${userId}`),

  getPaymentDetails: (transactionId) =>
    paymentsAxios.get(`/transaction/${transactionId}`),

  // Purchase Management
  purchaseMovie: (movieId, type) =>
    paymentsAxios.post('/purchase', { movieId, type }),

  downloadMovie: (movieId) =>
    paymentsAxios.post(`/download/${movieId}`),

  // Filmmaker Revenue
  getRevenue: (params) => 
    paymentsAxios.get('/revenue', { params }),

  withdrawRevenue: (amount) =>
    paymentsAxios.post('/withdraw', { amount }),

  getWithdrawalHistory: () =>
    paymentsAxios.get('/withdrawals'),
  deleteHistory: (transactionId) =>
    paymentsAxios.delete(`/transaction/${transactionId}`),
  getRevenueHistory: () =>
    paymentsAxios.get('/revenue-history'),
};