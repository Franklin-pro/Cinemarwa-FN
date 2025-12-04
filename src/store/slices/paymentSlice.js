import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsService } from '../../services/api/payments'; // Import your service

// Async Thunks
export const processMoMoPayment = createAsyncThunk(
  'payments/processMoMo',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processMoMoPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'MoMo payment failed');
    }
  }
);

export const checkMoMoPaymentStatus = createAsyncThunk(
  'payments/checkMoMoStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.checkMoMoPaymentStatus(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Status check failed');
    }
  }
);

export const processStripePayment = createAsyncThunk(
  'payments/processStripe',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processStripePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Stripe payment failed');
    }
  }
);

export const purchaseMovie = createAsyncThunk(
  'payments/purchaseMovie',
  async ({ movieId, type, paymentMethod = 'momo', paymentData = {} }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.purchaseMovie(movieId, type, paymentMethod, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Purchase failed');
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payments/getHistory',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getPaymentHistory(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);


// Slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    currentTransaction: null,
    paymentHistory: [],
    loading: false,
    error: null,
    success: false,
    polling: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearTransaction: (state) => {
      state.currentTransaction = null;
    },
    setPolling: (state, action) => {
      state.polling = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Process MoMo Payment
    builder
      .addCase(processMoMoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processMoMoPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.success = true;
      })
      .addCase(processMoMoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Check MoMo Payment Status
    builder
      .addCase(checkMoMoPaymentStatus.pending, (state) => {
        state.polling = true;
      })
      .addCase(checkMoMoPaymentStatus.fulfilled, (state, action) => {
        state.polling = false;
        if (state.currentTransaction && state.currentTransaction.transactionId === action.payload.transactionId) {
          state.currentTransaction = {
            ...state.currentTransaction,
            ...action.payload
          };
        }
        
        if (action.payload.status === 'SUCCESSFUL') {
          state.success = true;
          state.paymentHistory.push(action.payload);
        }
      })
      .addCase(checkMoMoPaymentStatus.rejected, (state, action) => {
        state.polling = false;
        state.error = action.payload;
      });

    // Purchase Movie
    builder
      .addCase(purchaseMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.success = true;
      })
      .addCase(purchaseMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get History
    builder
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload.data || action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearTransaction, setPolling } = paymentSlice.actions;
export default paymentSlice.reducer;