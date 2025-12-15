import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import authService from '../../services/api/auth';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Async Thunks
// store/slices/authSlice.js - Update register thunk
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role, deviceFingerprint }, { rejectWithValue }) => {
    try {
      const response = await authService.register({ 
        name, 
        email, 
        password, 
        role,
        deviceFingerprint 
      });
      
      // Store token, user data, and fingerprint
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('deviceFingerprint', deviceFingerprint);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Backend sends OTP and asks for verification
      // Store email temporarily for OTP verification step
      localStorage.setItem('tempEmail', credentials.email);

      return {
        ...response.data,
        requiresOTP: true,
        email: credentials.email
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verify-otp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp
      });

      // Backend returns token and user data on successful OTP verification
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.removeItem('tempEmail');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'OTP verification failed',
        code: error.response?.data?.code,
        remainingAttempts: error.response?.data?.remainingAttempts
      });
    }
  }
);

// Google OAuth Authentication
export const googleAuth = createAsyncThunk(
  'auth/google',
  async (googleToken, { rejectWithValue }) => {
    try {
      // Step 1: Redirect to backend Google OAuth endpoint
      // Backend handles: GET /api/auth/google
      // This initiates the OAuth flow and redirects to Google
      window.location.href = `${API_URL}/auth/google`;

      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google authentication failed');
    }
  }
);

// Handle Google OAuth Callback (called from callback component)
export const handleGoogleCallback = createAsyncThunk(
  'auth/google-callback',
  async (_, { rejectWithValue }) => {
    try {
      // Step 2: Get user profile after callback
      // Backend handles: GET /api/auth/profile (requires auth token)
      const response = await axios.get(`${API_URL}/auth/profile`);

      // Step 3: Store user data and token
      if (response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.removeItem('tempEmail');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const logout = createAsyncThunk('/auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    // ignore network errors for logout, still clear local storage
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tempEmail');
  localStorage.removeItem('deviceFingerprint');
  localStorage.removeItem('deviceFingerprintHash');
  return null;
});
export const logoutAll = createAsyncThunk('/auth/logoutAll', async () => {
  try {
    await authService.logoutAll();
  } catch (error) {
    // ignore network errors for logoutAll, still clear local storage
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tempEmail');
  localStorage.removeItem('deviceFingerprint');
  localStorage.removeItem('deviceFingerprintHash');
  return null;
});
export const deleteAccount = createAsyncThunk('/auth/deleteAccount', async () => {
  try {
    await authService.deleteAccount();
  } catch (error) {
    // ignore network errors for deleteAccount, still clear local storage
    console.error("Error deleting account:", error);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tempEmail');
  localStorage.removeItem('deviceFingerprint');
  localStorage.removeItem('deviceFingerprintHash');
  return null;
});


// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login (only sends OTP, doesn't authenticate yet)
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        // Don't set user/token yet - wait for OTP verification
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // OTP Verification
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Google Auth
    builder
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        // Redirect happens in thunk, no state update needed
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Google Callback Handler
    builder
      .addCase(handleGoogleCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Optimistic UI update: clear user while logout request is in progress
        state.user = null;
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      })
      .addCase(logoutAll.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Optimistic UI update: clear user while logoutAll request is in progress
        state.user = null;
        state.token = null;
      })
      .addCase(logoutAll.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
