import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsService } from '../../services/api/payments';

// ====== ASYNC THUNKS ======

// Process MoMo Payment
export const processMoMoPayment = createAsyncThunk(
  'payments/processMoMo',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processMoMoPayment(paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ MoMo Payment Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.response?.data?.error || 'MoMo payment failed',
        isApiError: true
      });
    }
  }
);

// Check MoMo Payment Status
export const checkMoMoPaymentStatus = createAsyncThunk(
  'payments/checkMoMoStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.checkMoMoPaymentStatus(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Status check failed',
        isApiError: true
      });
    }
  }
);

// Process Stripe Payment
export const processStripePayment = createAsyncThunk(
  'payments/processStripe',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processStripePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Stripe payment failed',
        isApiError: true
      });
    }
  }
);

// Process Subscription MoMo Payment
export const processSubscriptionMomoPayment = createAsyncThunk(
  'payments/processSubscriptionMoMo',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processSubscriptionMomoPayment(paymentData);
      console.log('✅ Subscription MoMo response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Subscription MoMo Payment Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.response?.data?.error || 'MoMo payment failed',
        isApiError: true
      });
    }
  }
);

// Process Subscription Stripe Payment
export const processSubscriptionStripePayment = createAsyncThunk(
  'payments/processSubscriptionStripe',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processSubscriptionStripePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Stripe payment failed',
        isApiError: true
      });
    }
  }
);

// Get Payment History
export const getPaymentHistory = createAsyncThunk(
  'payments/getHistory',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getPaymentHistory(userId, { page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch payment history',
        isApiError: true
      });
    }
  }
);

// Get Payment Details
export const getPaymentDetails = createAsyncThunk(
  'payments/getDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getPaymentDetails(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch payment details',
        isApiError: true
      });
    }
  }
);

// Get Withdrawal History
export const getWithdrawalHistory = createAsyncThunk(
  'payments/getWithdrawals',
  async ({ userId, page = 1, limit = 20, status, type }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getWithdrawalHistory(userId, { 
        page, 
        limit, 
        status, 
        type 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch withdrawal history',
        isApiError: true
      });
    }
  }
);

// Get Withdrawal Details
export const getWithdrawalDetails = createAsyncThunk(
  'payments/getWithdrawalDetails',
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getWithdrawalDetails(withdrawalId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        ...error.response?.data,
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch withdrawal details',
        isApiError: true
      });
    }
  }
);

// ====== SLICE ======

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    // Current transaction
    currentTransaction: null,
    currentPaymentDetails: null,
    
    // History
    paymentHistory: [],
    paymentPagination: null,
    
    // Withdrawals
    withdrawalHistory: [],
    withdrawalPagination: null,
    currentWithdrawal: null,
    
    // UI States
    loading: false,
    error: null,
    success: false,
    polling: false,
    
    // Payment status tracking
    paymentStatus: null, // PENDING, SUCCESSFUL, FAILED
    gatewayStatus: null, // Gateway response status
    withdrawalsProcessed: false,
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
      state.paymentStatus = null;
      state.gatewayStatus = null;
      state.withdrawalsProcessed = false;
    },
    setPolling: (state, action) => {
      state.polling = action.payload;
    },
    updatePaymentStatus: (state, action) => {
      state.paymentStatus = action.payload.status;
      if (action.payload.gatewayStatus) {
        state.gatewayStatus = action.payload.gatewayStatus;
      }
    },
    // 🔥 NEW: Reset all processing states
    resetProcessingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.polling = false;
    }
  },
  extraReducers: (builder) => {
    // ====== PROCESS MOMO PAYMENT ======
    builder
      .addCase(processMoMoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processMoMoPayment.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        // Check if API returned success: false
        if (response.success === false) {
          state.error = {
            message: response.message || 'Payment failed',
            details: response.details || response,
            isApiError: true
          };
          state.success = false;
          return;
        }
        
        state.currentTransaction = response.data || response;
        state.paymentStatus = response.data?.status || response.status;
        state.gatewayStatus = response.data?.customerTransaction?.gatewayStatus;
        state.withdrawalsProcessed = !!response.data?.withdrawals;
        
        // If gateway is SUCCESSFUL, mark as success immediately
        if (state.gatewayStatus === 'SUCCESSFUL' || state.paymentStatus === 'SUCCESSFUL') {
          state.success = true;
        } else if (state.paymentStatus === 'PENDING') {
          state.polling = true;
        }
      })
      .addCase(processMoMoPayment.rejected, (state, action) => {
        state.loading = false;
        
        // Handle error from rejectWithValue
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Payment request failed',
            isNetworkError: true
          };
        }
        state.success = false;
      });

    // ====== CHECK MOMO PAYMENT STATUS ======
    builder
      .addCase(checkMoMoPaymentStatus.pending, (state) => {
        state.polling = true;
      })
      .addCase(checkMoMoPaymentStatus.fulfilled, (state, action) => {
        state.polling = false;
        const responseData = action.payload.data || action.payload;
        
        // Check if API returned success: false
        if (responseData.success === false) {
          state.error = {
            message: responseData.message || 'Payment status check failed',
            details: responseData.details || responseData,
            isApiError: true
          };
          return;
        }
        
        // Update current transaction if it matches
        if (state.currentTransaction?.transactionId === responseData.transactionId) {
          state.currentTransaction = {
            ...state.currentTransaction,
            ...responseData,
          };
        }
        
        // Update payment status
        state.paymentStatus = responseData.status;
        
        // If successful, add to history and mark success
        if (responseData.status === 'SUCCESSFUL') {
          state.success = true;
          
          // Add to payment history if not already there
          const existsInHistory = state.paymentHistory.some(
            p => p.transactionId === responseData.transactionId
          );
          if (!existsInHistory) {
            state.paymentHistory.unshift(responseData);
          }
        } else if (responseData.status === 'FAILED') {
          state.error = {
            message: responseData.reason || 'Payment failed',
            details: responseData,
            isApiError: true
          };
        }
      })
      .addCase(checkMoMoPaymentStatus.rejected, (state, action) => {
        state.polling = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Status check failed',
            isNetworkError: true
          };
        }
      });

    // ====== PROCESS STRIPE PAYMENT ======
    builder
      .addCase(processStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        if (response.success === false) {
          state.error = {
            message: response.message || 'Stripe payment failed',
            details: response.details || response,
            isApiError: true
          };
          state.success = false;
          return;
        }
        
        state.currentTransaction = response.data || response;
        state.success = true;
      })
      .addCase(processStripePayment.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Stripe payment request failed',
            isNetworkError: true
          };
        }
        state.success = false;
      });

    // ====== PROCESS SUBSCRIPTION MOMO PAYMENT ======
    builder
      .addCase(processSubscriptionMomoPayment.pending, (state) => {
        console.log('🔄 Subscription MoMo payment pending...');
        state.loading = true;
        state.error = null;
        state.success = false;
        state.polling = false;
      })
      .addCase(processSubscriptionMomoPayment.fulfilled, (state, action) => {
        console.log('✅ Subscription MoMo payment fulfilled:', action.payload);
        state.loading = false;
        
        const response = action.payload;
        
        // Check if API returned success: false
        if (response.success === false) {
          state.error = {
            message: response.message || 'Payment failed',
            details: response.details || response,
            isApiError: true
          };
          state.success = false;
          return;
        }
        
        // Handle successful response
        state.currentTransaction = response.data || response;
        state.paymentStatus = response.data?.status || response.status;
        state.gatewayStatus = response.data?.gatewayStatus || response.gatewayStatus;
        state.withdrawalsProcessed = !!response.data?.withdrawals;
        
        // Check if payment was immediately successful
        if (state.gatewayStatus === 'SUCCESSFUL' || state.paymentStatus === 'SUCCESSFUL') {
          state.success = true;
        } else if (state.paymentStatus === 'PENDING') {
          state.polling = true;
        }
      })
      .addCase(processSubscriptionMomoPayment.rejected, (state, action) => {
        console.log('❌ Subscription MoMo payment rejected:', action.payload);
        state.loading = false;
        
        // Handle error from rejectWithValue
        if (action.payload?.isApiError) {
          // API returned structured error
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          // Network or other error
          state.error = {
            message: action.payload || 'Payment request failed',
            isNetworkError: true
          };
        }
        state.success = false;
      });

    // ====== PROCESS SUBSCRIPTION STRIPE PAYMENT ======
    builder
      .addCase(processSubscriptionStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processSubscriptionStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        if (response.success === false) {
          state.error = {
            message: response.message || 'Stripe payment failed',
            details: response.details || response,
            isApiError: true
          };
          state.success = false;
          return;
        }
        
        state.currentTransaction = response.data || response;
        state.success = true;
      })
      .addCase(processSubscriptionStripePayment.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Stripe payment request failed',
            isNetworkError: true
          };
        }
        state.success = false;
      });

    // ====== GET PAYMENT HISTORY ======
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload;
        state.paymentHistory = responseData.data || responseData.payments || [];
        state.paymentPagination = responseData.pagination || null;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Failed to fetch payment history',
            isNetworkError: true
          };
        }
      });

    // ====== GET PAYMENT DETAILS ======
    builder
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPaymentDetails = action.payload.data || action.payload.payment;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Failed to fetch payment details',
            isNetworkError: true
          };
        }
      });

    // ====== GET WITHDRAWAL HISTORY ======
    builder
      .addCase(getWithdrawalHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWithdrawalHistory.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload;
        state.withdrawalHistory = responseData.data || responseData.withdrawals || [];
        state.withdrawalPagination = responseData.pagination || null;
      })
      .addCase(getWithdrawalHistory.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Failed to fetch withdrawal history',
            isNetworkError: true
          };
        }
      });

    // ====== GET WITHDRAWAL DETAILS ======
    builder
      .addCase(getWithdrawalDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWithdrawalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWithdrawal = action.payload.data || action.payload.withdrawal;
      })
      .addCase(getWithdrawalDetails.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isApiError) {
          state.error = {
            message: action.payload.message,
            details: action.payload.details || action.payload,
            statusCode: action.payload.statusCode,
            isApiError: true
          };
        } else {
          state.error = {
            message: action.payload || 'Failed to fetch withdrawal details',
            isNetworkError: true
          };
        }
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearTransaction, 
  setPolling,
  updatePaymentStatus,
  resetProcessingState // Export the new action
} = paymentSlice.actions;

export default paymentSlice.reducer;