import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const moviesAxios = axios.create({
  baseURL: `${API_URL}/movies`,
});

// Add token to requests
moviesAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const moviesService = {
  // Movie CRUD
  getAllMovies: (params) => moviesAxios.get('/', { params }),
  getMovie: (id) => moviesAxios.get(`/${id}`),
  getMovieById: (id) => moviesAxios.get(`/${id}`),
  uploadMovie: (formData, onUploadProgress) =>
    moviesAxios.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress,
    }),
  createSeries : (filmmakerId,formData) =>
    moviesAxios.post(`/${filmmakerId}/series`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
addEpisodeToSeries : (filmmakerId,seriesId, formData) =>
    moviesAxios.post(`/${filmmakerId}/series/${seriesId}/add-episode`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMovie: (id, data) => moviesAxios.put(`/${id}`, data),
  deleteMovie: (id) => moviesAxios.delete(`/${id}`),

  // User movies
  getUserMovies: () => moviesAxios.get('/user/my-movies'),
  getUserPurchasedMovies: () => moviesAxios.get('/user/purchased'),

  // Reviews
  getMovieReviews: (movieId) => moviesAxios.get(`/${movieId}/reviews`),
  addReview: (movieId, reviewData) =>
    moviesAxios.post(`/${movieId}/reviews`, reviewData),
  updateReview: (movieId, reviewId, reviewData) =>
    moviesAxios.put(`/${movieId}/reviews/${reviewId}`, reviewData),
  deleteReview: (movieId, reviewId) =>
    moviesAxios.delete(`/${movieId}/reviews/${reviewId}`),
    // Get filmmaker's series
  getFilmmakerSeries: (filmmakerId) =>
    moviesAxios.get(`/movies/filmmaker/${filmmakerId}/series`).then(res => res.data),

  // Ratings
  rateMovie: (movieId, rating) =>
    moviesAxios.post(`/${movieId}/rating`, { rating }),
  getMovieRating: (movieId) => moviesAxios.get(`/${movieId}/rating`),

  // Search & Filter
  searchMovies: (query) => moviesAxios.get('/search', { params: { q: query } }),
  filterMovies: (filters) => moviesAxios.get('/filter', { params: filters }),

  // Stats
  getMovieStats: (movieId) => moviesAxios.get(`/${movieId}/stats`),
  getSecureStreamUrl: (movieId) => moviesAxios.get(`/secure-stream/${movieId}`),
};

// Export as named export for easier use
export const moviesAPI = moviesService;
export default moviesService;
