import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const filmmmakerAPI = axios.create({
  baseURL: `${API_URL}/filmmaker`,
});

// Add token to requests
filmmmakerAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const filmmmakerService = {
  // ====== PROFILE MANAGEMENT ======
  getProfile: () => filmmmakerAPI.get('/profile'),
  updateProfile: (data) => filmmmakerAPI.put('/profile', data),

  // ====== DASHBOARD & ANALYTICS ======
  getDashboard: () => filmmmakerAPI.get('/dashboard'),
  getMovieAnalytics: (movieId) => filmmmakerAPI.get(`/analytics/${movieId}`),
  getStats: () => filmmmakerAPI.get('/stats'),
  getSeriesEpisodes: (seriesId) => filmmmakerAPI.get(`/series/${seriesId}/episodes`),


  // ====== PAYMENT METHOD ======
  getPaymentMethod: () => filmmmakerAPI.get('/payment-method'),
  updatePaymentMethod: (data) => filmmmakerAPI.put('/payment-method', data),

  // ====== FINANCIAL ======
  getFinancialSummary: () => filmmmakerAPI.get('/finance'),
  // requestWithdrawal: (amount) => filmmmakerAPI.post('/withdrawals/request', { amount }),
  getWithdrawalHistory: () => filmmmakerAPI.get('/withdrawals'),

  // ====== MOVIE MANAGEMENT ======
  getMovies: () => filmmmakerAPI.get('/movies'),
  editMovie: (movieId, data) => filmmmakerAPI.put(`/movies/${movieId}`, data),
  getCategories: (categoryId) => filmmmakerAPI.get(`/category/${categoryId}`),
};

export default filmmmakerService;
