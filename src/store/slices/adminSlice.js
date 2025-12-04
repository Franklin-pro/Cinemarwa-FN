import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminAPI from '../../services/api/admin';

// ====== ASYNC THUNKS ======

// Dashboard & Analytics
export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAPI.getDashboard();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const data = await adminAPI.getAnalytics(period);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Filmmaker Management
export const fetchFilmmakers = createAsyncThunk(
  'admin/fetchFilmmakers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await adminAPI.getAllFilmmakers(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch filmmakers');
    }
  }
);

export const fetchPendingFilmmakers = createAsyncThunk(
  'admin/fetchPendingFilmmakers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAPI.getPendingFilmmakers();
      console.log(' Pending Filmmakers Data:', data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending filmmakers');
    }
  }
);

export const approveFilmmakerAction = createAsyncThunk(
  'admin/approveFilmmaker',
  async ({ filmamakerId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveFilmmaker(filmamakerId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve filmmaker');
    }
  }
);

export const verifyFilmmakerBankAction = createAsyncThunk(
  'admin/verifyFilmmakerBank',
  async ({ filmamakerId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.verifyFilmmakerBank(filmamakerId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify bank');
    }
  }
);

// User Management
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAPI.getAllUsers();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const blockUserAction = createAsyncThunk(
  'admin/blockUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.blockUser(userId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user');
    }
  }
);

export const unblockUserAction = createAsyncThunk(
  'admin/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.unblockUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
    }
  }
);

export const deleteUserAction = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deleteUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Content Moderation
export const fetchPendingMovies = createAsyncThunk(
  'admin/fetchPendingMovies',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAPI.getPendingMovies();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending movies');
    }
  }
);

export const approveMovieAction = createAsyncThunk(
  'admin/approveMovie',
  async ({ movieId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveMovie(movieId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve movie');
    }
  }
);

export const fetchFlaggedContent = createAsyncThunk(
  'admin/fetchFlaggedContent',
  async (type = 'all', { rejectWithValue }) => {
    try {
      const data = await adminAPI.getFlaggedContent(type);
      return data.flaggedMovies;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flagged content');
    }
  }
);

// Payment Reconciliation
export const fetchPaymentReconciliation = createAsyncThunk(
  'admin/fetchPaymentReconciliation',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const data = await adminAPI.getPaymentReconciliation(period);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment reconciliation');
    }
  }
);

// ====== SLICE ======

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    // Dashboard
    dashboard: null,
    analytics: null,

    // Filmmakers
    filmmakers: [],
    pendingFilmmakers: [],

    // Users
    users: [],

    // Movies
    pendingMovies: [],
    flaggedContent: [],

    // Payments
    paymentReconciliation: null,

    // UI States
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Filmmakers
    builder
      .addCase(fetchFilmmakers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFilmmakers.fulfilled, (state, action) => {
        state.loading = false;
        state.filmmakers = action.payload.data || [];
      })
      .addCase(fetchFilmmakers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchPendingFilmmakers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingFilmmakers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFilmmakers = action.payload.data || [];
      })
      .addCase(fetchPendingFilmmakers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveFilmmakerAction.fulfilled, (state, action) => {
        state.successMessage = 'Filmmaker approved successfully';
        state.pendingFilmmakers = state.pendingFilmmakers.filter(
          (f) => f._id !== action.payload.filmmaker?._id
        );
      })
      .addCase(approveFilmmakerAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(blockUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User blocked successfully';
        state.users = state.users.map((u) =>
          u._id === action.payload.user?._id ? action.payload.user : u
        );
      })
      .addCase(blockUserAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(unblockUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User unblocked successfully';
        state.users = state.users.map((u) =>
          u._id === action.payload.user?._id ? action.payload.user : u
        );
      })
      .addCase(unblockUserAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User deleted successfully';
        state.users = state.users.filter((u) => u._id !== action.meta.arg);
      })
      .addCase(deleteUserAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Movies
    builder
      .addCase(fetchPendingMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingMovies = action.payload.data || [];
      })
      .addCase(fetchPendingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveMovieAction.fulfilled, (state, action) => {
        state.successMessage = 'Movie approved successfully';
        state.pendingMovies = state.pendingMovies.filter(
          (m) => m._id !== action.payload.movie?._id
        );
      })
      .addCase(approveMovieAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(fetchFlaggedContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlaggedContent.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedContent = action.payload || [];
      })
      .addCase(fetchFlaggedContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Payments
    builder
      .addCase(fetchPaymentReconciliation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentReconciliation.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentReconciliation = action.payload;
      })
      .addCase(fetchPaymentReconciliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage } = adminSlice.actions;
export default adminSlice.reducer;
