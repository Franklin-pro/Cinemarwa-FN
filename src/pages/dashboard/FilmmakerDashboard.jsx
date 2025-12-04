import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { 
  Film, TrendingUp, DollarSign, Upload, Eye, Download, Settings, 
  BarChart3, Wallet, ChevronRight, AlertCircle, CheckCircle, 
  Menu, X, Home, Video, CreditCard, History, Bell, FileText,
  LogOut, User, Moon, Sun
} from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';
import cinemaLoaiding from '../../assets/cinema.gif';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentHistory } from '../../store/slices/paymentSlice';

function FilmmakerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, moviesRes, statsRes, paymentRes] = await Promise.all([
        filmmmakerService.getDashboard(),
        filmmmakerService.getMovies(),
        filmmmakerService.getStats(),
        filmmmakerService.getPaymentMethod(),
      ]);

      const dashboardInfo = dashboardRes.data;
      const moviesList = moviesRes.data?.data || [];
      const statsInfo = statsRes.data;
      const paymentInfo = paymentRes.data;

      setDashboardData(dashboardInfo);
      setMovies(moviesList);
      setStats(statsInfo);
      setPaymentMethod(paymentInfo);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getUsers = useSelector((state) => state.auth.user);
  const userId = getUsers?.id;


useEffect(() => {
  if (userId) {
    dispatch(getPaymentHistory(userId));
  }
}, [dispatch, userId]);


const paymentHistory = useSelector((state) => state.payments.paymentHistory);
// const pagination = useSelector((state) => state.payments.pagination);
// const loadingHistory = useSelector((state) => state.payment.loading);
// const errorHistory = useSelector((state) => state.payment.error);

  const handleManageMovie = (movieId) => {
    navigate(`/admin/movies/${movieId}/edit`);
  };

  const handleViewAnalytics = (movieId) => {
    navigate(`/admin/movies/${movieId}/analytics`);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const formatNumber = (value) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const totalSeconds = parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h : ${minutes}m : ${secs}s` : `${hours}h`;
    } 
    if (minutes > 0) {
      return secs > 0 ? `${minutes}m : ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
  };

  const userInfo = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'movies', label: 'My Movies', icon: Video },
    { id: 'upload', label: 'Upload Movie', icon: Upload },
    { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'withdrawals', label: 'Withdrawal History', icon: History },
    { id: 'notifications', label: 'Payment History', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-200`}>
        <img src={cinemaLoaiding} alt="Loading..." className="w-32 h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Film, label: 'Total Movies', value: dashboardData?.summary?.totalMovies || stats?.totalMovies || '0', color: 'blue' },
    { icon: Eye, label: 'Total Views', value: formatNumber(dashboardData?.summary?.totalViews || stats?.totalViews || 0), color: 'purple' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${formatCurrency(dashboardData?.summary?.filmmmakerEarnings || stats?.filmmmakerEarnings || 0)}`, color: 'green' },
    { icon: Download, label: 'Total Downloads', value: formatNumber(dashboardData?.summary?.totalDownloads || stats?.totalDownloads || 0), color: 'orange' },
  ];

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 flex flex-col flex-shrink-0`}>
        {/* Logo/Header */}
        <div className={`h-16 flex items-center justify-between px-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            {sidebarOpen ? <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} /> : <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'upload') {
                      navigate('/dashboard/filmmaker/upload');
                    } else if (item.id === 'payment') {
                      navigate('/filmmaker/payment-method');
                    } else if (item.id === 'withdrawals') {
                      navigate('/filmmaker/withdrawal-request');
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? darkMode 
                        ? 'bg-blue-900/50 text-blue-400 font-medium'
                        : 'bg-blue-50 text-blue-600 font-medium'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* LogOut */}
        <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t p-4`}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LogOut className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t p-4`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 uppercase bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userInfo?.name?.charAt(0) || 'F'}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userInfo?.name || 'Filmmaker'}
                </p>
                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userInfo?.email || 'filmmaker@example.com'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200`}>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className={`relative p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/filmmaker/upload')} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Movie
            </button>
          </div>
        </header>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
          <div className="p-6">
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Account Summary Card */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>ACCOUNT SUMMARY</h2>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filmmaker Account</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account ID: {dashboardData?.user?._id?.slice(-6) || 'XXXXXX'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      ${formatCurrency(dashboardData?.finance?.availableBalance || 0)}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available</p>
                  </div>
                </div>

                <button className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:text-blue-700">
                  More Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                  <div
                    key={i}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:shadow-md'} border rounded-xl p-6 transition-all duration-200`}
                  >
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600 mb-3`} />
                    <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity & Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Revenue Summary
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>This Month</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${formatCurrency(dashboardData?.summary?.thisMonthRevenue || 0)}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>This Year</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${formatCurrency(dashboardData?.summary?.thisYearRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Earnings</span>
                      <span className="text-xl font-bold text-green-600">
                        ${formatCurrency(dashboardData?.summary?.totalRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Avg Views per Movie</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(dashboardData?.summary?.avgViewsPerMovie || 0)}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Platform Fees</span>
                      <span className="font-bold text-orange-600">
                        ${formatCurrency(dashboardData?.summary?.platformFee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Account Status</span>
                      <span className={`font-bold ${
                        dashboardData?.approval?.status === 'verified' || dashboardData?.approval?.status === 'approved'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}>
                        {(dashboardData?.approval?.status || 'Pending')?.charAt(0).toUpperCase() + 
                         (dashboardData?.approval?.status || 'Pending')?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {paymentMethod && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Wallet className="w-5 h-5 text-blue-600" />
                    Payment Method
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your payment methods to ensure timely payouts
                  </p>
                  
                  {paymentMethod?.currentMethod ? (
                    <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-4 transition-colors duration-200`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className={`font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {paymentMethod.currentMethod}
                          </span>
                        </div>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Active
                        </span>
                      </div>

                      {paymentMethod.currentMethod === 'momo' && paymentMethod.paymentDetails?.momo && (
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Phone Number:</p>
                          <p className="font-mono font-medium">{paymentMethod.paymentDetails.momo}</p>
                        </div>
                      )}

                      {paymentMethod.currentMethod === 'bank' && paymentMethod.paymentDetails?.allMethods?.bankDetails && (
                        <div className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Bank:</span> <span className="font-medium">{paymentMethod.paymentDetails.allMethods.bankDetails.bankName}</span></p>
                          <p><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Account:</span> <span className="font-medium">****{paymentMethod.paymentDetails.allMethods.bankDetails.accountNumber?.slice(-4)}</span></p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-4 flex items-start gap-3 transition-colors duration-200`}>
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>No payment method configured</p>
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Add a payment method to receive payouts</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/filmmaker/payment-method')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {paymentMethod?.currentMethod ? 'Update Payment Method' : 'Add Payment Method'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOVIES SECTION */}
          {activeSection === 'movies' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Movies ({movies.length})</h2>
                <button
                  onClick={() => navigate('/dashboard/filmmaker/upload')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Movie
                </button>
              </div>

              {movies.length === 0 ? (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center transition-colors duration-200`}>
                  <Film className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You haven't uploaded any movies yet</p>
                  <button
                    onClick={() => navigate('/dashboard/filmmaker/upload')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Upload Your First Movie
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {movies.map((movie) => (
                    <div
                      key={movie._id}
                      className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:shadow-lg'} rounded-lg overflow-hidden border transition-all group`}
                    >
                      <div className={`aspect-video ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center overflow-hidden relative`}>
                        {movie.backdrop ? (
                          <img
                            src={
                          // If it's a full URL (backend), use directly
                          (movie.backdrop_path || movie.backdrop)?.startsWith('http')
                            ? (movie.backdrop_path || movie.backdrop)
                            // If it's TMDB path, add TMDB domain
                            : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                        }
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Film className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className={`font-semibold truncate flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <span className="truncate">{movie.title}</span>
                          <span className={`text-xs ml-2 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(movie.createdAt)}
                          </span>
                        </div>
                        <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>Duration: {formatDuration(movie.videoDuration || movie.runtime)}</p>
                          <p>Views: {formatNumber(movie.totalViews || 0)}</p>
                          <p>Revenue: ${formatCurrency(movie.totalRevenue || 0)}</p>
                          <p className="capitalize">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              movie.status === 'published' ? 'bg-green-100 text-green-700' :
                              movie.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {movie.status}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleViewAnalytics(movie._id)}
                            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors font-medium"
                          >
                            Analytics
                          </button>
                          <button
                            onClick={() => handleManageMovie(movie._id)}
                            className={`flex-1 text-xs px-3 py-2 rounded transition-colors font-medium ${
                              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EARNINGS SECTION */}
          {activeSection === 'earnings' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Earnings & Withdrawals</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <Wallet className="w-8 h-8 text-blue-600 mb-3" />
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available Balance</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${formatCurrency(dashboardData?.finance?.availableBalance || 0)}
                  </p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <DollarSign className="w-8 h-8 text-green-600 mb-3" />
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Payout</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${formatCurrency(dashboardData?.finance?.pendingBalance || 0)}
                  </p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earned</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${formatCurrency(dashboardData?.finance?.totalEarned || 0)}
                  </p>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request Withdrawal</h3>
                <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6 transition-colors duration-200`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    ⚠️ Minimum withdrawal: $50 | Processing time: 5-7 business days
                  </p>
                </div>
                <button
                  onClick={() => navigate('/filmmaker/withdrawal-request')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Request Withdrawal
                </button>
              </div>
            </div>
          )}

          {/* ANALYTICS SECTION */}
          {activeSection === 'analytics' && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center transition-colors duration-200`}>
              <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Detailed analytics and insights coming soon</p>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
     {activeSection === 'notifications' && (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      border rounded-xl p-6 transition-colors duration-200`}>

    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      Payment History
    </h3>

    {loading && <p className="text-gray-400">Loading...</p>}
    {error && <p className="text-red-500">{error}</p>}

    {paymentHistory?.length === 0 && (
      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        No payment history available.
      </p>
    )}

    <div className="space-y-4 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {paymentHistory?.map((payment) => (
        <div
          key={payment.id}
          className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
            p-4 rounded-lg flex justify-between`}
        >
          <div>
            <span className={` font-bold flex items-center gap-3 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
              <p>{payment.movie.title}</p> 
              <p className={` text-sm ${darkMode ? 'text-gray-100' : 'text-gray-500'}`}> <span className={`${payment.paymentStatus === 'success' ? 'bg-green-500/15 rounded-full text-green-500' : payment.paymentStatus === 'pending' ? 'bg-yellow-500/15 rounded-full text-yellow-500' : 'bg-red-500/15 px-4 py-1 rounded-full text-red-500'} ${payment.paymentStatus ==='failed'}`}> {payment.paymentStatus}</span></p>
            </span>
            <p className={` text-sm ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>{payment.paymentMethod}</p>
            <p className={` text-xs  ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
              {new Date(payment.paymentDate).toLocaleString()}
            </p>
          </div>

          <p className={` text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-500'}`}>{payment.amount} {payment.currency}</p>
        </div>
      ))}
    </div>
  </div>
)}


          {/* DOCUMENTS SECTION */}
          {activeSection === 'documents' && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center transition-colors duration-200`}>
              <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Documents</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Your contracts, invoices, and statements</p>
            </div>
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
              
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h3>
                <div className="space-y-2">
                  <button className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
                  } border`}>
                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Profile Information</span>
                    <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                  <button className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
                  } border`}>
                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Security & Password</span>
                    <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                  <button className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
                  } border`}>
                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Notification Preferences</span>
                    <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 transition-colors duration-200`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Theme</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {darkMode ? 'Dark mode is enabled' : 'Light mode is enabled'}
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-5 h-5" />
                        <span>Switch to Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5" />
                        <span>Switch to Dark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FilmmakerDashboard;