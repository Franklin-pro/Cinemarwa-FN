import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
});

// Add token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (userData) => authAPI.post('/register', userData),
  login: (credentials) => authAPI.post('/login', credentials),
  logout: () =>authAPI.post('/logout').then(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }),
  getCurrentUser: () => authAPI.get('/me'),
  updateProfile: (profileData) => authAPI.put('/profile', profileData),
  changePassword: (passwordData) => authAPI.post('/change-password', passwordData),
};

export default authService;
