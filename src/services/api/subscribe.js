import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const subscribeAPI = axios.create({
  baseURL: `${API_URL}/subscribe`,
});

// Add token to requests
subscribeAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const subscribeService = {
  // Subscribe to notifications
  subscribeCinemaRwa: (data) =>
    subscribeAPI.post('/new', data),

  // Notify all subscribers (admin only)
  notifySubscribers: (data) => {
    // If FormData is provided (with an image), let axios set multipart headers
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return subscribeAPI.post('/notify', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // Otherwise send JSON
    return subscribeAPI.post('/notify', data);
  },

  // Change subscriber status (admin only)
  changeSubscribeStatus: (data) =>
    subscribeAPI.put('/status', data),

  // Get all subscribers
  getSubscribers: (params = {}) =>
    subscribeAPI.get('/subscribers', { params }),

  // Unsubscribe (deactivate)
  unsubscribe: (email) =>
    subscribeAPI.put('/status', { email, isActive: false }),
};

export default subscribeAPI;
