import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CheckCircle,
  Download,
  Play,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Home,
  Smartphone,
  CreditCard,
  User,
  Calendar,
  Zap,
  ExternalLink,
  FileDown,
  Eye,
  Video
} from 'lucide-react';
import { getPaymentDetails } from '../store/slices/paymentSlice';

function PaymentSuccess() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { currentPaymentDetails, loading, error } = useSelector((state) => state.payments);
  
  const [payment, setPayment] = useState(null);
  const [movie, setMovie] = useState(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  useEffect(() => {
    if (transactionId) {
      dispatch(getPaymentDetails(transactionId));
    }
  }, [transactionId, dispatch]);

  useEffect(() => {
    if (currentPaymentDetails) {
      const paymentData = currentPaymentDetails.payment || currentPaymentDetails;
      setPayment(paymentData);
      
      // Check if this is a subscription payment
      const isSub = paymentData.type?.includes('subscription');
      setIsSubscription(isSub);
      
      if (!isSub && paymentData.movie) {
        setMovie(paymentData.movie);
      }
      
      // Check if secure URLs are available but not present in state
      if (!isSub && paymentData.paymentStatus === 'succeeded' && 
          !paymentData.secureDownloadUrl && !paymentData.secureStreamingUrl) {
        // Fetch updated payment details to get URLs
        setTimeout(() => {
          dispatch(getPaymentDetails(transactionId));
        }, 2000);
      }
    }
  }, [currentPaymentDetails, dispatch, transactionId]);

  const formatCurrency = (amount, currency = 'RWF') => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'RWF',
        minimumFractionDigits: 0,
      }).format(Number(amount) || 0);
    } catch (err) {
      console.error('Error formatting currency:', err);
      return `${Number(amount) || 0} ${currency || 'RWF'}`;
    }
  };

  const handleRefreshAccess = () => {
    setIsCheckingAccess(true);
    dispatch(getPaymentDetails(transactionId))
      .finally(() => setIsCheckingAccess(false));
  };

  const handleDownload = (url) => {
    if (url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      
      // Track download attempt
      console.log('Download initiated:', url);
    }
  };

  const handleWatchMovie = () => {
    if (payment?.secureStreamingUrl || payment?.secureHlsUrl) {
      // Store streaming info for the watch page
      const streamingData = {
        streamingUrl: payment.secureStreamingUrl,
        hlsUrl: payment.secureHlsUrl,
        movieId: payment.movieId,
        paymentId: payment.id,
        token: payment.secureStreamingUrl?.split('token=')[1] || payment.secureHlsUrl?.split('token=')[1],
        movieTitle: movie?.title,
        poster: movie?.poster,
        type: payment.type
      };
      
      localStorage.setItem('streamingData', JSON.stringify(streamingData));
      navigate(`/watch/${payment.movieId}`);
    }
  };

  const getAccessButton = () => {
    if (isSubscription) {
      return (
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          <Zap className="w-6 h-6 group-hover:animate-pulse" />
          Go to Your Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }

    // Check if payment has secure URLs
    const hasDownloadAccess = payment?.secureDownloadUrl && (payment.type === 'download' || payment.type === 'movie_download');
    const hasWatchAccess = (payment?.secureStreamingUrl || payment?.secureHlsUrl) && (payment.type === 'watch' || payment.type === 'movie_watch');

    if (hasDownloadAccess) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-green-900/20 border-2 border-green-700/50 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-green-300 text-lg">Ready to Download</h3>
                <p className="text-sm text-green-400/80">Permanent access</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              Your movie is ready for download. Click the button below to start downloading.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDownload(payment.secureDownloadUrl)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <FileDown className="w-5 h-5" />
                Download Movie File
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate(`/download/${payment.movieId}`)}
                className="w-full bg-green-800/40 hover:bg-green-800/60 text-green-300 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Download Page
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Download link valid for 24 hours
          </div>
        </div>
      );
    }

    if (hasWatchAccess) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-blue-900/20 border-2 border-blue-700/50 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-blue-300 text-lg">Ready to Watch</h3>
                <p className="text-sm text-blue-400/80">48-hour rental</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              Your streaming access is ready. Watch now or later within 48 hours.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleWatchMovie}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <Video className="w-5 h-5" />
                Watch Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {payment.secureStreamingUrl && (
                <button
                  onClick={() => handleDownload(payment.secureStreamingUrl)}
                  className="w-full bg-blue-800/40 hover:bg-blue-800/60 text-blue-300 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Stream File
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Access valid for 48 hours from now
          </div>
        </div>
      );
    }

    // If payment succeeded but no URLs yet
    if (payment?.paymentStatus === 'succeeded') {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900/20 border-2 border-yellow-700/50 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <RefreshCw className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-300">Processing Access</h3>
                <p className="text-sm text-yellow-400/80">Almost there!</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              Your payment is confirmed! We're setting up your access. This usually takes a few moments.
            </p>
            
            <button
              onClick={handleRefreshAccess}
              disabled={isCheckingAccess}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isCheckingAccess ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking Access...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Check Access Status
                </>
              )}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            If access doesn't appear after a minute, please contact support.
          </div>
        </div>
      );
    }

    // Fallback for other cases
    return (
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-bold text-gray-300 mb-2">Access Status Unknown</h3>
          <p className="text-sm text-gray-400 mb-4">
            Unable to determine your access status. Please check your dashboard or contact support.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-16 h-16 animate-spin text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Payment Details
          </h2>
          <p className="text-gray-400">Please wait while we fetch your transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Payment Not Found</h2>
          <p className="text-gray-400 mb-8">
            {error || 'The payment details could not be loaded.'}
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go to Home
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <User className="w-5 h-5" />
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Animated Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-8"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(to bottom, ${
                ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i % 4]
              }, transparent)`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            </div>
            
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium mb-3 md:mb-4 animate-pulse">
              <Shield className="w-4 h-4 mr-2" />
              Payment Verified & Secured
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              {isSubscription 
                ? 'Your subscription has been activated successfully!'
                : 'Your payment has been processed successfully! Enjoy your content.'
              }
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left: Order Summary */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Transaction Details */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-400" />
                  Transaction Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Transaction ID</div>
                      <div className="font-mono text-sm md:text-lg text-white bg-gray-900/50 p-2 md:p-3 rounded-lg break-all">
                        {payment.transactionId || payment.id}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Date & Time</div>
                      <div className="flex items-center text-white">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(payment.paymentDate || payment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Payment Method</div>
                      <div className="flex items-center text-white">
                        {payment.paymentMethod === 'MoMo' ? (
                          <>
                            <Smartphone className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                            <span>MTN Mobile Money</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                            <span>Credit/Debit Card</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Amount Paid</div>
                      <div className="text-2xl md:text-3xl font-bold text-green-400">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Status</div>
                      <div className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">COMPLETED</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">Reference ID</div>
                      <div className="font-mono text-xs md:text-sm text-gray-300 truncate">
                        {payment.referenceId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movie or Subscription Details */}
              {isSubscription ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-purple-400" />
                    Subscription Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="text-xs md:text-sm text-gray-400 mb-1">Plan</div>
                        <div className="text-lg md:text-xl font-bold text-white">
                          {payment.metadata?.planName || payment.planId || 'Premium'}
                        </div>
                        <div className="text-xs md:text-sm text-gray-400">
                          {payment.metadata?.period === 'year' ? 'Annual Plan' : 'Monthly Plan'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs md:text-sm text-gray-400 mb-1">Max Devices</div>
                        <div className="text-base md:text-lg text-white">
                          {payment.metadata?.maxDevices || 4} devices
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="text-xs md:text-sm text-gray-400 mb-1">Access Period</div>
                        <div className="flex items-center text-white">
                          <Clock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          {payment.subscriptionPeriod === 'year' ? '1 Year' : '30 Days'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs md:text-sm text-gray-400 mb-1">Next Billing</div>
                        <div className="text-white">
                          {payment.subscriptionEndDate 
                            ? new Date(payment.subscriptionEndDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subscription Features */}
                  <div className="mt-6 md:mt-8">
                    <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">What's Included:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-300">Ad-free streaming</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-300">HD & 4K quality</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-300">Download for offline</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-300">Multiple devices</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : movie && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                    <Play className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-400" />
                    Movie Details
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="w-full md:w-40 lg:w-48 flex-shrink-0">
                      <img
                        src={
                          movie.poster?.startsWith?.("http")
                            ? movie.poster
                            : movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : '/placeholder-poster.jpg'
                        }
                        alt={movie.title}
                        className="w-full h-48 md:h-56 lg:h-64 rounded-xl object-cover shadow-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{movie.title}</h3>
                      <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4 line-clamp-3 md:line-clamp-4">
                        {movie.overview}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <div className="text-xs md:text-sm text-gray-400 mb-1">Access Type</div>
                          <div className="text-base md:text-lg font-bold text-blue-400">
                            {payment.type === 'movie_watch' ? '48-Hour Rental' : 'Permanent Download'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs md:text-sm text-gray-400 mb-1">Access Expires</div>
                          <div className="flex items-center text-white">
                            <Clock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm md:text-base">
                              {payment.type === 'movie_watch' 
                                ? '48 hours from now'
                                : 'Never expires'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {payment.type === 'movie_download' && movie.fileSize && (
                        <div className="mt-3 md:mt-4">
                          <div className="text-xs md:text-sm text-gray-400 mb-1">File Size</div>
                          <div className="text-sm md:text-base text-gray-300">
                            {(movie.fileSize / 1024).toFixed(1)} GB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {getAccessButton()}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <button
                    onClick={() => navigate('/')}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <Home className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    My Dashboard
                  </button>
                  
                  <Link
                    to="/movies"
                    className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-center group"
                  >
                    Browse Movies
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Help & Support */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-400" />
                  Need Help?
                </h3>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="p-3 md:p-4 bg-gray-900/30 rounded-lg">
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Technical Support</h4>
                    <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
                      Having issues with your purchase? Contact our support team.
                    </p>
                    <button 
                      onClick={() => window.open('mailto:support@cinemarwanda.com')}
                      className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      Contact Support
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-900/30 rounded-lg">
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Refund Policy</h4>
                    <p className="text-xs md:text-sm text-gray-400">
                      {payment.type === 'download' 
                        ? '30-day refund window for downloads'
                        : 'Refunds available within 24 hours'
                      }
                    </p>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-900/30 rounded-lg">
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Download Issues?</h4>
                    <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
                      Having trouble downloading? Try using a different browser.
                    </p>
                    <button 
                      onClick={handleRefreshAccess}
                      className="text-xs md:text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                    >
                      Regenerate Link
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Receipt</h3>
                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                  A receipt has been sent to your email at{' '}
                  <span className="text-white">{user?.email}</span>
                </p>
                <button 
                  onClick={() => {
                    // Generate a simple receipt
                    const receiptData = {
                      transactionId: payment.transactionId || payment.id,
                      date: new Date(payment.paymentDate || payment.createdAt).toLocaleString(),
                      amount: formatCurrency(payment.amount, payment.currency),
                      movie: movie?.title || 'Subscription',
                      type: payment.type
                    };
                    
                    const receiptText = `Payment Receipt\n\nTransaction ID: ${receiptData.transactionId}\nDate: ${receiptData.date}\nAmount: ${receiptData.amount}\nItem: ${receiptData.movie}\nType: ${receiptData.type}`;
                    
                    const blob = new Blob([receiptText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `receipt-${receiptData.transactionId}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors"
                >
                  Download Receipt
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-blue-700/30 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-400" />
                  Your Purchase
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="text-green-400 font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Access Type</span>
                    <span className="text-blue-300 font-medium">
                      {payment.type === 'watch' ? 'Streaming' : 'Download'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Valid Until</span>
                    <span className="text-gray-300">
                      {payment.type === 'watch' 
                        ? new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString()
                        : 'Permanent'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation CSS */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes animate-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PaymentSuccess;