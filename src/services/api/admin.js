import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const adminAPI = axios.create({
  baseURL: `${API_URL}/admin`
});

// Add token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====== DASHBOARD & ANALYTICS ======

export const getDashboard = async () => {
  const response = await adminAPI.get('/dashboard');
  return response.data;
};

export const getAnalytics = async (period = 'month') => {
  const response = await adminAPI.get(`/analytics?period=${period}`);
  return response.data;
};

// ====== FILMMAKER MANAGEMENT ======

export const getAllFilmmakers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await adminAPI.get(`/filmmakers${params ? '?' + params : ''}`);
  return response.data;
};

export const getPendingFilmmakers = async () => {
  const response = await adminAPI.get('/filmmakers/pending');
  return response.data;
};

export const approveFilmmaker = async (filmamakerId, data) => {
  const response = await adminAPI.patch(`/filmmakers/${filmamakerId}/approve`, data);
  return response.data;
};

export const verifyFilmmakerBank = async (filmamakerId, data) => {
  const response = await adminAPI.patch(`/filmmakers/${filmamakerId}/verify-bank`, data);
  return response.data;
};

// ====== USER MANAGEMENT ======

export const getAllUsers = async () => {
  const response = await adminAPI.get(`/users`);
  return response.data;
};

export const blockUser = async (userId, reason) => {
  const response = await adminAPI.patch(`/users/${userId}/block`, { reason });
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await adminAPI.patch(`/users/${userId}/unblock`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await adminAPI.delete(`/users/${userId}`);
  return response.data;
};

// ====== CONTENT MODERATION ======

export const getPendingMovies = async () => {
  const response = await adminAPI.get('/movies/pending');
  return response.data;
};

export const approveMovie = async (movieId, data) => {
  const response = await adminAPI.patch(`/movies/${movieId}/approve`, data);
  return response.data;
};

export const getFlaggedContent = async (type = 'all') => {
  const response = await adminAPI.get(`/flagged-content?type=${type}`);
  return response.data;
};

// ====== PAYMENT RECONCILIATION ======

export const getPaymentReconciliation = async (period = 'month') => {
  const response = await adminAPI.get(`/payments/reconciliation?period=${period}`);
  return response.data;
};

export default adminAPI;
