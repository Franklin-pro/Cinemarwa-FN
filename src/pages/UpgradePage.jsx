import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {  
  processSubscriptionMomoPayment,
  processSubscriptionStripePayment,
  checkMoMoPaymentStatus,
  clearTransaction,
  clearError,
  resetProcessingState
} from '../store/slices/paymentSlice';
import {
  Check,
  Shield,
  Lock,
  CreditCard,
  Smartphone,
  ChevronLeft,
  AlertCircle,
  Loader2,
  LogIn,
  User,
  Zap,
  Crown,
  Star
} from 'lucide-react';

// Enhanced Plans Configuration
const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Begin Your Journey',
    price: 0,
    priceRwf: 0,
    period: 'month',
    description: 'Perfect for getting started with basic access',
    features: [
      'Access to basic movie catalog',
      'Standard quality streaming (720p)',
      'Watch on 1 device simultaneously',
      'Basic customer support',
      'Ad-supported experience',
      'Limited movie downloads (5/month)'
    ],
    color: 'gray',
    popular: false,
    maxDevices: 1,
    stripePriceId: null,
    icon: Star,
    gradient: 'from-gray-400 to-gray-600',
    badge: null,
    annualSavings: 0,
    recommendedFor: 'Casual viewers',
    highlights: ['No commitment', 'Try risk-free']
  },
  {
    id: 'pro',
    name: 'Professional',
    tagline: 'Elevate Your Experience',
    price: 29,
    priceRwf: 35000,
    annuallyDiscountedPrice: 299,
    annuallyDiscountedPriceRwf: 360000,
    period: 'month',
    description: 'Most popular choice for serious movie lovers',
    features: [
      'Full HD streaming (1080p)',
      'Watch on 4 devices simultaneously',
      'Ad-free experience',
      'Download unlimited movies',
      'Priority customer support',
      'Early access to new releases',
      'Custom watchlists & profiles',
      '4K upgrade available'
    ],
    color: 'blue',
    popular: true,
    maxDevices: 4,
    stripePriceId: 'price_pro_monthly',
    icon: Crown,
    gradient: 'from-blue-500 to-blue-600',
    badge: 'Most Popular',
    annualSavings: 17,
    recommendedFor: 'Movie enthusiasts & families',
    highlights: ['Best value', 'Family sharing', 'Premium features']
  },
  {
    id: 'max',
    name: 'Ultimate',
    tagline: 'The Complete Experience',
    price: 99,
    priceRwf: 120000,
    annuallyDiscountedPrice: 999,
    annuallyDiscountedPriceRwf: 1200000,
    period: 'month',
    description: 'Unlimited access for the ultimate entertainment',
    features: [
      '4K Ultra HD streaming',
      'Watch on 10 devices simultaneously',
      'Dolby Atmos sound',
      'Exclusive content access',
      '24/7 premium support',
      'Offline downloads (100+)',
      'Advanced parental controls',
      'Annual free merchandise',
      'VIP event invitations',
      'Dedicated account manager'
    ],
    color: 'blue',
    popular: false,
    maxDevices: 10,
    stripePriceId: 'price_enterprise_monthly',
    icon: Zap,
    gradient: 'from-blue-600 to-green-600',
    badge: 'Premium',
    annualSavings: 16,
    recommendedFor: 'Businesses & power users',
    highlights: ['Enterprise-grade', 'VIP benefits', 'Maximum devices']
  }
];

// Helper functions
const getCurrencySymbol = (currency) => currency === 'rwf' ? 'RWF' : '$';

const formatRwfAmount = (amount) => {
  return parseInt(amount).toLocaleString('en-RW');
};

const isValidMoMoPhone = (phone) => {
  const phoneRegex = /^(078|079)\d{7}$/;
  return phoneRegex.test(phone);
};

const formatPhoneForBackend = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('0')) {
    return '0' + phone.substring(1);
  }
  if (!phone.startsWith('+')) {
    return '0' + phone;
  }
  return phone;
};

function UpgradePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Track if this is the first render
  const firstRender = useRef(true);
  
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  };
  
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };
  
  const {
    loading,
    error,
    success,
    polling,
    currentTransaction,
    paymentStatus,
    gatewayStatus
  } = useSelector((state) => state.payments);
  
  const user = getCurrentUser();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(!isAuthenticated());
  const [formErrors, setFormErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  // Auto-set currency based on payment method
  const currency = paymentMethod === 'momo' ? 'rwf' : 'usd';

  // Reset processing state on component mount
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      dispatch(resetProcessingState());
    }
  }, [dispatch]);

  // Handle loading state based on Redux
  useEffect(() => {
    if (loading) {
      setLocalLoading(true);
    } else {
      // Small delay to show loading state properly
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    let interval;
    if (polling && currentTransaction?.transactionId) {
      interval = setInterval(() => {
        dispatch(checkMoMoPaymentStatus(currentTransaction.transactionId));
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, currentTransaction, dispatch]);

  useEffect(() => {
    if (success && (paymentStatus === 'SUCCESSFUL' || gatewayStatus === 'SUCCESSFUL')) {
      setShowSuccess(true);
      setLocalLoading(false);
      setTimeout(() => {
        navigate('/dashboard?upgrade=success');
      }, 3000);
    }
  }, [success, paymentStatus, gatewayStatus, navigate]);

  // Reset local loading when error occurs
  useEffect(() => {
    if (error) {
      setLocalLoading(false);
    }
  }, [error]);

  const handlePlanSelect = (plan) => {
    if (plan.id === 'free') {
      navigate('/register');
      return;
    }
    setSelectedPlan(plan);
    dispatch(clearError());
    setFormErrors({});
  };

  const handleGetPlanClick = (plan) => {
    if (plan.id === 'free') {
      navigate('/register');
      return;
    }
    
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedPlan(plan);
    dispatch(clearTransaction());
    setShowPaymentForm(true);
    setLocalLoading(false);
  };

  const handleLoginRedirect = () => {
    sessionStorage.setItem('upgradeRedirect', JSON.stringify({
      planId: selectedPlan.id,
      price: currency === 'rwf' ? selectedPlan.priceRwf : selectedPlan.price,
      currency
    }));
    navigate('/login?redirect=/upgrade');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Clear previous errors
    dispatch(clearError());
    setFormErrors({});
    setLocalLoading(true);
    
    // Determine amount based on currency
    const amount = currency === 'rwf' ? selectedPlan.priceRwf : selectedPlan.price;
    
    // Format amount for MoMo (whole numbers for RWF)
    const formattedAmount = paymentMethod === 'momo' ? parseInt(amount) : amount;
    
    // Build payment data object
    const paymentData = {
      amount: formattedAmount,
      currency: paymentMethod === 'momo' ? 'RWF' : currency.toUpperCase(),
      planId: selectedPlan.id,
      period: selectedPlan.period,
      type: 'subscription_upgrade',
      userId: user.id,
      email: user.email || '',
      metadata: {
        planName: selectedPlan.name,
        period: selectedPlan.period,
        maxDevices: selectedPlan.maxDevices,
        paymentMethod,
        currency
      }
    };

    if (paymentMethod === 'momo') {
      // Validate MoMo phone number
      if (!phoneNumber) {
        setFormErrors({ phoneNumber: 'Phone number is required for MoMo payments' });
        setLocalLoading(false);
        return;
      }
      
      if (!isValidMoMoPhone(phoneNumber)) {
        setFormErrors({ 
          phoneNumber: 'Please enter a valid Rwanda MoMo number (078XXXXXXX or 079XXXXXXX)' 
        });
        setLocalLoading(false);
        return;
      }
      
      // Format phone number for backend
      const formattedPhone = formatPhoneForBackend(phoneNumber);
      
      // Create MoMo specific payment data
      const momoPaymentData = {
        ...paymentData,
        phoneNumber: formattedPhone,
        amount: parseInt(amount)
      };
      dispatch(processSubscriptionMomoPayment(momoPaymentData));
    } else {
      const stripePaymentData = {
        ...paymentData,
        phoneNumber: '',
        description: `Upgrade to ${selectedPlan.name} Plan`
      };
      dispatch(processSubscriptionStripePayment(stripePaymentData));
    }
  };

  const getErrorMessage = () => {
    if (!error) return '';
    
    // Handle the error object structure from Redux
    if (typeof error === 'object') {
      if (error.message) return error.message;
      if (typeof error === 'string') return error;
      try {
        return JSON.stringify(error);
      } catch {
        return 'An error occurred';
      }
    }
    
    if (typeof error === 'string') return error;
    
    return 'An unknown error occurred';
  };

  const getStatusMessage = () => {
    if (localLoading || loading) return 'Processing payment...';
    if (polling) return 'Waiting for payment confirmation...';
    const errorMsg = getErrorMessage();
    if (errorMsg) return errorMsg;
    if (gatewayStatus === 'PENDING') return 'Please complete payment on your phone';
    if (success) return 'Payment successful!';
    return '';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500 bg-red-500/15 bg-opacity-10 border-red-500';
    if (localLoading || loading || polling) return 'text-blue-400 bg-blue-500 bg-opacity-10 border-blue-500';
    if (success) return 'text-green-400 bg-green-500 bg-opacity-10 border-green-500';
    return '';
  };

  // Check if we're currently processing
  const isProcessing = localLoading || loading || polling;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/75 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl max-w-md w-full p-8 border border-gray-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Login Required
                </h3>
                <p className="text-gray-400">
                  Please login or create an account to upgrade your plan
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Login to Continue
                </button>
                
                <Link
                  to="/register"
                  className="block w-full border border-gray-600 hover:border-gray-500 text-white py-3 px-6 rounded-lg font-semibold text-center transition-all"
                >
                  <User className="w-5 h-5 inline mr-2" />
                  Create New Account
                </Link>
                
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-400 hover:text-gray-300 py-3 px-6 rounded-lg font-medium transition-all"
                >
                  Continue Browsing Plans
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Select the plan that works best for you
          </p>
          
          {/* Billing Toggle */}
          {!showPaymentForm && (
            <div className="inline-flex items-center bg-[#2a2a2a] rounded-full p-1 border border-gray-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-transparent text-white' 
                    : 'text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-[#3a3a3a] text-white' 
                    : 'text-gray-400'
                }`}
              >
                Yearly
                <span className="ml-2 text-blue-400 text-xs">Save 17%</span>
              </button>
            </div>
          )}
          
          {user && (
            <div className="inline-flex items-center bg-blue-600 bg-opacity-20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mt-4">
              <User className="w-4 h-4 mr-2" />
              Logged in as {user.name || user.email}
            </div>
          )}
        </div>

        {showSuccess ? (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Upgrade Successful! 🎉
            </h2>
            <p className="text-gray-400 mb-8">
              Your {selectedPlan.name} is now active. Redirecting to dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : !showPaymentForm ? (
          <>
            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-16">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-[#2a2a2a] border-2 border-blue-500' 
                      : 'bg-[#232323] border border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="w-12 h-12 mb-4">
                      <svg viewBox="0 0 100 100" className="text-gray-400">
                        <circle cx="50" cy="20" r="8" fill="currentColor"/>
                        <line x1="50" y1="28" x2="50" y2="80" stroke="currentColor" strokeWidth="3"/>
                        <circle cx="35" cy="45" r="6" fill="currentColor"/>
                        <circle cx="65" cy="45" r="6" fill="currentColor"/>
                        <circle cx="35" cy="70" r="6" fill="currentColor"/>
                        <circle cx="65" cy="70" r="6" fill="currentColor"/>
                        <line x1="50" y1="45" x2="35" y2="45" stroke="currentColor" strokeWidth="2"/>
                        <line x1="50" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="2"/>
                        <line x1="50" y1="70" x2="35" y2="70" stroke="currentColor" strokeWidth="2"/>
                        <line x1="50" y1="70" x2="65" y2="70" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.subtitle}</p>
                    
                    <div className="mb-4">
                      {plan.price === 0 ? (
                        <div className="text-4xl font-bold">$0</div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold">
                            ${plan.price}
                            <span className="text-lg text-gray-400 font-normal">
                              / month {plan.description}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleGetPlanClick(plan)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6 ${
                      plan.id === 'free'
                        ? 'bg-white text-black hover:bg-gray-200'
                        : plan.popular
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]'
                    }`}
                  >
                    {plan.id === 'free' ? 'Use Claude for free' : `Get ${plan.name} plan`}
                  </button>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setShowPaymentForm(false);
                dispatch(clearTransaction());
                setFormErrors({});
                setPhoneNumber('');
                setLocalLoading(false);
              }}
              className="flex items-center text-gray-400 hover:text-gray-300 mb-6"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to plans
            </button>

            <div className="bg-[#232323] rounded-2xl border border-gray-700 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Complete Payment</h2>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400">
                    You're upgrading to <span className="font-semibold text-white">{selectedPlan.name}</span>
                  </p>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      {currency === 'rwf' ? formatRwfAmount(selectedPlan.priceRwf) : `$${selectedPlan.price}`}
                    </span>
                    <span className="text-gray-400 ml-2 text-sm">
                      {getCurrencySymbol(currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('card');
                      setFormErrors({});
                    }}
                    disabled={isProcessing}
                    className={`p-5 border-2 rounded-xl transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/15'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <CreditCard className={`w-10 h-10 mb-3 ${paymentMethod === 'card' ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span className="font-medium text-lg mb-1">Credit/Debit Card</span>
                      <span className="text-sm text-gray-400">Pay in USD</span>
                      <span className="text-xl font-bold mt-2">${selectedPlan.price}</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('momo');
                      setFormErrors({});
                    }}
                    disabled={isProcessing}
                    className={`p-5 border-2 rounded-xl transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${
                      paymentMethod === 'momo'
                        ? 'border-green-500 bg-green-500/15'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Smartphone className={`w-10 h-10 mb-3 ${paymentMethod === 'momo' ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="font-medium text-lg mb-1">MoMo Wallet</span>
                      <span className="text-sm text-gray-400">Pay in RWF</span>
                      <span className="text-xl font-bold mt-2">RWF {formatRwfAmount(selectedPlan.priceRwf)}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center">
                    <Smartphone className={`w-4 h-4 mr-2 ${paymentMethod === 'momo' ? 'text-green-400' : 'text-blue-400'}`} />
                    {paymentMethod === 'momo' ? 'MoMo Phone Number (Rwanda)' : 'Phone Number'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (formErrors.phoneNumber) {
                        setFormErrors({});
                      }
                    }}
                    placeholder={paymentMethod === 'momo' ? '078XXXXXXXX' : '+250 78X XXX XXX'}
                    disabled={isProcessing}
                    className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg focus:ring-2 ${
                      paymentMethod === 'momo' ? 'focus:ring-green-500' : 'focus:ring-blue-500'
                    } focus:border-transparent text-white placeholder-gray-500 ${
                      formErrors.phoneNumber ? 'border-red-500' : 'border-gray-600'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                
                {paymentMethod === 'momo' && (
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Enter your MoMo number starting with 078 or 079 (e.g., 0781234567)
                  </p>
                )}
                
                {formErrors.phoneNumber && (
                  <div className="mt-2 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                    <p className="text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {formErrors.phoneNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              {(isProcessing || error || gatewayStatus || success) && (
                <div className={`mb-6 p-4 rounded-lg border ${getStatusColor()}`}>
                  <div className="flex items-center">
                    {isProcessing && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                    {gatewayStatus === 'PENDING' && <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />}
                    <p className="font-medium">{getStatusMessage()}</p>
                  </div>
                  
                  {currentTransaction?.transactionId && (
                    <p className="text-sm mt-2 opacity-70">Transaction ID: {currentTransaction.transactionId}</p>
                  )}
                  
                  {gatewayStatus === 'PENDING' && paymentMethod === 'momo' && (
                    <div className="mt-3 p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg">
                      <div className="flex items-start">
                        <Smartphone className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-400 font-medium">Check your phone</p>
                          <p className="text-xs text-yellow-300 mt-1">
                            Approve the payment of RWF {formatRwfAmount(selectedPlan.priceRwf)} on your MoMo app
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <button
                      type="button"
                      onClick={() => dispatch(clearError())}
                      className="text-sm text-red-400 hover:text-red-300 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={isProcessing || (paymentMethod === 'momo' && !phoneNumber)}
                className={`w-full ${
                  paymentMethod === 'momo' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6 mr-3" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'momo' ? (
                      <>
                        <Smartphone className="w-5 h-5 mr-2" />
                        Pay RWF {formatRwfAmount(selectedPlan.priceRwf)} via MoMo
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ${selectedPlan.price} with Card
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-sm">Secure Payment</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm">256-bit Encryption</span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                  {paymentMethod === 'momo' 
                    ? 'Secured by MTN Rwanda Mobile Money' 
                    : 'Secured by Stripe Payment Processing'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpgradePage;