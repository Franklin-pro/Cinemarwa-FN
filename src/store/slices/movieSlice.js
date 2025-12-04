import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Async Thunks
export const uploadMovie = createAsyncThunk(
  'movies/uploadMovie',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const getUserMovies = createAsyncThunk(
  'movies/getUserMovies',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/movies/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch movies');
    }
  }
);

export const getMovieReviews = createAsyncThunk(
  'movies/getReviews',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/movies/${movieId}/reviews`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const addReview = createAsyncThunk(
  'movies/addReview',
  async ({ movieId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies/${movieId}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const rateMovie = createAsyncThunk(
  'movies/rateMovie',
  async ({ movieId, rating }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies/${movieId}/rate`, { rating }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate movie');
    }
  }
);

// Slice
const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    userMovies: [],
    reviews: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Upload Movie
    builder
      .addCase(uploadMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.userMovies.push(action.payload);
      })
      .addCase(uploadMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get User Movies
    builder
      .addCase(getUserMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.userMovies = action.payload;
      })
      .addCase(getUserMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Reviews
    builder
      .addCase(getMovieReviews.fulfilled, (state, action) => {
        state.reviews[action.meta.arg] = action.payload;
      });

    // Add Review
    builder
      .addCase(addReview.fulfilled, (state, action) => {
        const movieId = action.meta.arg.movieId;
        if (state.reviews[movieId]) {
          state.reviews[movieId].push(action.payload);
        }
      });

    // Rate Movie
    builder
      .addCase(rateMovie.pending, (state) => {
        state.loading = true;
      })
      .addCase(rateMovie.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(rateMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = movieSlice.actions;
export default movieSlice.reducer;
