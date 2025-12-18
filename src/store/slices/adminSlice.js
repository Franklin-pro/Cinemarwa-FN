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

export const filmmakerPerformance = createAsyncThunk(
  '/filmmakers/performance',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const data = await adminAPI.getFilmmakerPerformance(period);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);
export const recentlyActivities = createAsyncThunk(
  '/admin/recent-activities',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const data = await adminAPI.recentActivities(period);
      return data; // RETURN FULL RESPONSE
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
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
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending filmmakers');
    }
  }
);

// FIXED: Corrected parameter name from filmamakerId to filmmakerId
export const approveFilmmakerAction = createAsyncThunk(
  'admin/approveFilmmaker',
  async ({ filmmakerId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveFilmmaker(filmmakerId, data);
      return { response, filmmakerId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve filmmaker');
    }
  }
);

// FIXED: Corrected parameter name from filmamakerId to filmmakerId
export const verifyFilmmakerBankAction = createAsyncThunk(
  'admin/verifyFilmmakerBank',
  async ({ filmmakerId, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.verifyFilmmakerBank(filmmakerId, data);
      return { response, filmmakerId, data };
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
      return { response, userId };
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
      return { response, userId };
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
      return { response, userId };
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
      return { response, movieId, data };
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
      return data.flaggedMovies || data;
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

    // Activities - ADD THIS
    activities: null,

    // Filmmaker Performance - ADD THIS
    filmmakersPerformance: null,

    // UI States
    loading: false,
    error: null,
    successMessage: null,
    approvingId: null, // Track which filmmaker is being approved
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setApprovingId: (state, action) => {
      state.approvingId = action.payload;
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

    // Filmmaker Performance
    builder
      .addCase(filmmakerPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filmmakerPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.filmmakersPerformance = action.payload;
      })
      .addCase(filmmakerPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Recent Activities - FIXED: Store in correct property
    builder
      .addCase(recentlyActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recentlyActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload; // FIXED: Store in activities, not filmmakersPerformance
      })
      .addCase(recentlyActivities.rejected, (state, action) => {
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
        state.filmmakers = action.payload.data || action.payload || [];
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
        state.pendingFilmmakers = action.payload.data || action.payload || [];
      })
      .addCase(fetchPendingFilmmakers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveFilmmakerAction.pending, (state, action) => {
        state.approvingId = action.meta.arg.filmmakerId;
        state.loading = true;
      })
      .addCase(approveFilmmakerAction.fulfilled, (state, action) => {
        state.loading = false;
        state.approvingId = null;
        state.successMessage = 'Filmmaker approved successfully';
        
        // Remove approved filmmaker from pending list
        const filmmakerId = action.payload.filmmakerId;
        state.pendingFilmmakers = state.pendingFilmmakers.filter(
          (f) => f._id !== filmmakerId && f.id !== filmmakerId
        );
        
        // Update in main filmmakers list if exists
        state.filmmakers = state.filmmakers.map((f) => 
          (f._id === filmmakerId || f.id === filmmakerId) 
            ? { ...f, status: 'approved', approvedAt: new Date().toISOString() }
            : f
        );
      })
      .addCase(approveFilmmakerAction.rejected, (state, action) => {
        state.loading = false;
        state.approvingId = null;
        state.error = action.payload;
      });

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(blockUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User blocked successfully';
        const userId = action.payload.userId;
        state.users = state.users.map((u) =>
          (u._id === userId || u.id === userId) 
            ? { ...u, status: 'blocked', blockedAt: new Date().toISOString() }
            : u
        );
      })
      .addCase(blockUserAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(unblockUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User unblocked successfully';
        const userId = action.payload.userId;
        state.users = state.users.map((u) =>
          (u._id === userId || u.id === userId) 
            ? { ...u, status: 'active', blockedAt: null }
            : u
        );
      })
      .addCase(unblockUserAction.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteUserAction.fulfilled, (state, action) => {
        state.successMessage = 'User deleted successfully';
        const userId = action.payload.userId;
        state.users = state.users.filter((u) => 
          u._id !== userId && u.id !== userId
        );
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
        state.pendingMovies = action.payload.data || action.payload || [];
      })
      .addCase(fetchPendingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveMovieAction.fulfilled, (state, action) => {
        state.successMessage = 'Movie approved successfully';
        const movieId = action.payload.movieId;
        state.pendingMovies = state.pendingMovies.filter(
          (m) => m._id !== movieId && m.id !== movieId
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

export const { clearError, clearSuccessMessage, setApprovingId } = adminSlice.actions;
export default adminSlice.reducer;