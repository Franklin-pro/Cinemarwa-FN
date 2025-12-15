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

export const createSeries = createAsyncThunk(
  'movies/createSeries',
  async ({ filmmakerId, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies/${filmmakerId}/series`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Create series failed');
    }
  }
);

export const addEpisodeToSeries = createAsyncThunk(
  'movies/addEpisodeToSeries',
  async ({ filmmakerId, seriesId, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies/${filmmakerId}/series/${seriesId}/add-episode`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Add episode to series failed');
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

export const getFilmmakerSeries = createAsyncThunk(
  'movies/getFilmmakerSeries',
  async (filmmakerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/movies/filmmaker/${filmmakerId}/series`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch series');
    }
  }
);

export const getSeriesEpisodes = createAsyncThunk(
  'movies/getSeriesEpisodes',
  async ({ filmmakerId, seriesId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/movies/${filmmakerId}/series/${seriesId}/episodes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch episodes');
    }
  }
);

export const clearUploadState = createAsyncThunk(
  'movies/clearUploadState',
  async () => {
    return;
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
export const deleteMovie = createAsyncThunk(
  'movies/deleteMovie',
  async (movieId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete movie');
    }
  }
);

// Slice
const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    userMovies: [],
    filmmakerSeries: [],
    seriesEpisodes: {},
    reviews: {},
    loading: false,
    seriesLoading: false,
    uploadLoading: false,
    uploadProgress: 0,
    uploadSuccess: false,
    uploadError: null,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Upload Movie
    builder
      .addCase(uploadMovie.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
        state.uploadProgress = 0;
      })
      .addCase(uploadMovie.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
        state.uploadProgress = 100;
        state.userMovies.push(action.payload);
      })
      .addCase(uploadMovie.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
        state.uploadSuccess = false;
        state.uploadProgress = 0;
      });

    // Create Series
    builder
      .addCase(createSeries.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(createSeries.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
        state.filmmakerSeries.push(action.payload);
      })
      .addCase(createSeries.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
      });

    // Add Episode to Series
    builder
      .addCase(addEpisodeToSeries.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(addEpisodeToSeries.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
        // Optionally update episodes list if you're tracking it
      })
      .addCase(addEpisodeToSeries.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
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

    // Get Filmmaker Series
    builder
      .addCase(getFilmmakerSeries.pending, (state) => {
        state.seriesLoading = true;
        state.error = null;
      })
      .addCase(getFilmmakerSeries.fulfilled, (state, action) => {
        state.seriesLoading = false;
        // Handle both response formats: {data: [...]} or direct array
        state.filmmakerSeries = action.payload?.data || action.payload || [];
      })
      .addCase(getFilmmakerSeries.rejected, (state, action) => {
        state.seriesLoading = false;
        state.error = action.payload;
        state.filmmakerSeries = [];
      });

    // Get Series Episodes
    builder
      .addCase(getSeriesEpisodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSeriesEpisodes.fulfilled, (state, action) => {
        state.loading = false;
        const { filmmakerId, seriesId } = action.meta.arg;
        const key = `${filmmakerId}-${seriesId}`;
        state.seriesEpisodes[key] = action.payload?.data || action.payload || [];
      })
      .addCase(getSeriesEpisodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear Upload State
    builder
      .addCase(clearUploadState.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadProgress = 0;
        state.uploadSuccess = false;
        state.uploadError = null;
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
      builder
      .addCase(deleteMovie.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.userMovies = state.userMovies.filter(movie => movie.id !== action.meta.arg);
      })
      .addCase(deleteMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUploadSuccess } = movieSlice.actions;
export default movieSlice.reducer;