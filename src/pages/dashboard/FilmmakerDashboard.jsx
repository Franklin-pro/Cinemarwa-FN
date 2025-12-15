import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Film,
  TrendingUp,
  DollarSign,
  Upload,
  Eye,
  Download,
  Settings,
  BarChart3,
  Wallet,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
  Home,
  Video,
  CreditCard,
  History,
  Bell,
  FileText,
  LogOut,
  User,
  Moon,
  Sun,
  Plus,
  Check,
  // Add these icons
  Trash2,
  MessageSquare,
  Zap,
  Star,
  ExternalLink,
} from "lucide-react";
import { filmmmakerService } from "../../services/api/filmmaker";
import cinemaLoaiding from "../../assets/loading.gif";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentHistory } from "../../store/slices/paymentSlice";
import { logoutAll } from "../../store/slices/authSlice";
import { deleteMovie } from "../../store/slices/movieSlice";

function FilmmakerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  
  // Add state for notification popover
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Payment Received",
      message: "Your payout of RWF 15,000 has been processed successfully.",
      time: "2 hours ago",
      unread: true,
      icon: DollarSign,
    },
    {
      id: 2,
      type: "info",
      title: "New Movie Uploaded",
      message: "Your movie 'The Last Journey' has been approved and published.",
      time: "1 day ago",
      unread: true,
      icon: Film,
    },
    {
      id: 3,
      type: "warning",
      title: "Payment Method Update",
      message: "Your payment method will expire in 7 days. Please update it.",
      time: "2 days ago",
      unread: false,
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "success",
      title: "New Follower",
      message: "Your channel gained 25 new followers this week.",
      time: "3 days ago",
      unread: false,
      icon: User,
    },
    {
      id: 5,
      type: "info",
      title: "Analytics Report",
      message: "Monthly performance report is now available. View insights.",
      time: "5 days ago",
      unread: false,
      icon: BarChart3,
    },
  ]);

  // Add ref for popover
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationRef.current &&
        bellRef.current &&
        !notificationRef.current.contains(event.target) &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Add notification handlers
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Mark all as read when opening
    if (!showNotifications) {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, unread: false }))
      );
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
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

      const dashboardInfo = dashboardRes.data.data;
      const moviesList = moviesRes.data?.data.movies || [];
      const statsInfo = statsRes.data;
      const paymentInfo = paymentRes.data;

      setDashboardData(dashboardInfo);
      setMovies(moviesList);
      setStats(statsInfo);
      setPaymentMethod(paymentInfo.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const [movieToDelete, setMovieToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteMovie = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (movieToDelete) {
      dispatch(deleteMovie(movieToDelete.id || movieToDelete._id))
        .unwrap()
        .then((res) => {
          console.log("Movie deleted successfully:", res);
          setMovies(prevMovies => prevMovies.filter(m => 
            m.id !== (movieToDelete.id || movieToDelete._id)
          ));
          setShowDeleteModal(false);
          setMovieToDelete(null);
        })
        .catch((err) => {
          console.error("Error deleting movie:", err);
          alert(`Failed to delete movie: ${err.message || "Unknown error"}`);
          setShowDeleteModal(false);
          setMovieToDelete(null);
        });
    }
  };

  const getUsers = useSelector((state) => state.auth.user);
  
  const userId = React.useMemo(() => {
    if (getUsers?.id) return getUsers.id;
    if (dashboardData?.user?._id) return dashboardData.user._id;
    const userFromLocalStorage = localStorage.getItem("user");
    if (userFromLocalStorage) {
      try {
        const parsedUser = JSON.parse(userFromLocalStorage);
        if (parsedUser.id || parsedUser._id) return parsedUser.id || parsedUser._id;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return null;
  }, [getUsers, dashboardData]);

  useEffect(() => {
    if (userId) {
      dispatch(getPaymentHistory({ userId, page: 1, limit: 50 }));
    }
  }, [dispatch, userId]);

  const handleLogout = async () => {
    await dispatch(logoutAll());
    navigate("/");
  };

  const paymentHistory = useSelector((state) => state.payments.paymentHistory);
  const loadingHistory = useSelector((state) => state.payments.loading);
  const errorHistory = useSelector((state) => state.payments.error);

  const handleViewSeriesEpisodes = (seriesId) => {
    navigate(`/filmmaker/series/${seriesId}/episodes`);
  };

  const handleManageContent = (content) => {
    if (content.contentType === "series") {
      navigate(`/filmmaker/series/${content.id}/edit`);
    } else if (content.contentType === "movie") {
      navigate(`/admin/movies/${content.id}/edit`);
    } else if (content.contentType === "episode") {
      navigate(`/filmmaker/episodes/${content.id}/edit`);
    }
  };

  const handleViewContentAnalytics = (content) => {
    if (content.contentType === "series") {
      navigate(`/filmmaker/series/${content.id}/analytics`);
    } else {
      navigate(`/admin/movies/${content.id}/analytics`);
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const formatNumber = (value) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString();
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "N/A";
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

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "movies", label: "My Movies", icon: Video },
    { id: "upload", label: "Upload Movie", icon: Upload },
    { id: "earnings", label: "Earnings & Payouts", icon: Wallet },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "withdrawals", label: "Withdrawal History", icon: History },
    { id: "history", label: "Payment History", icon: Bell },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center transition-colors duration-200`}>
        <img src={cinemaLoaiding} alt="Loading..." className="w-32 h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Film,
      label: "Total Movies",
      value: dashboardData?.summary?.totalMovies || stats?.totalMovies || "0",
      color: "blue",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatNumber(dashboardData?.summary?.totalViews || stats?.totalViews || 0),
      color: "purple",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `RWF ${formatCurrency(dashboardData?.summary?.filmmmakerEarnings || stats?.filmmmakerEarnings || 0)}`,
      color: "green",
    },
    {
      icon: Download,
      label: "Total Downloads",
      value: formatNumber(dashboardData?.summary?.totalDownloads || stats?.totalDownloads || 0),
      color: "orange",
    },
  ];

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} overflow-hidden transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r transition-all duration-300 flex flex-col flex-shrink-0`}>
        {/* Logo/Header */}
        <div className={`h-16 flex items-center justify-between px-4 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                Dashboard
              </span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-lg transition-colors`}>
            {sidebarOpen ? <X className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} /> : <Menu className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />}
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
                    if (item.id === "upload") {
                      navigate("/dashboard/filmmaker/upload");
                    } else if (item.id === "payment") {
                      navigate("/filmmaker/payment-method");
                    } else if (item.id === "withdrawals") {
                      navigate("/filmmaker/withdrawal-request");
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? darkMode
                        ? "bg-blue-900/50 text-blue-400 font-medium"
                        : "bg-blue-50 text-blue-600 font-medium"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* LogOut */}
        <div className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-t p-4`}>
          <button onClick={() => { handleLogout(); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
            <LogOut className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-t p-4`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 uppercase bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userInfo?.name?.charAt(0) || "F"}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {userInfo?.name || "Filmmaker"}
                </p>
                <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {userInfo?.email || "filmmaker@example.com"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showDeleteModal && movieToDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Movie
                </h3>
              </div>
              
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete <span className="font-semibold">"{movieToDelete.title}"</span>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMovieToDelete(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <header className={`h-16 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200`}>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {sidebarItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Bell with Popover */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={toggleNotifications}
                className={`relative p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Bell className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div
                  ref={notificationRef}
                  className={`absolute right-0 mt-2 w-96 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl border ${darkMode ? "border-gray-700" : "border-gray-200"} z-50 transition-all duration-200 transform origin-top-right`}
                >
                  {/* Header */}
                  <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className={`text-xs px-3 py-1 rounded-full ${darkMode ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className={`text-xs px-3 py-1 rounded-full ${darkMode ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                    </p>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className={`w-12 h-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                        <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 hover:${darkMode ? "bg-gray-700/50" : "bg-gray-50"} transition-colors ${notification.unread ? (darkMode ? "bg-blue-900/10" : "bg-blue-50/50") : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${notification.type === "success" ? (darkMode ? "bg-green-900/30" : "bg-green-100") : notification.type === "warning" ? (darkMode ? "bg-yellow-900/30" : "bg-yellow-100") : notification.type === "info" ? (darkMode ? "bg-blue-900/30" : "bg-blue-100") : (darkMode ? "bg-gray-700" : "bg-gray-100")}`}>
                                  <Icon className={`w-4 h-4 ${notification.type === "success" ? "text-green-600 dark:text-green-400" : notification.type === "warning" ? "text-yellow-600 dark:text-yellow-400" : notification.type === "info" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                        {notification.title}
                                      </h4>
                                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                        {notification.message}
                                      </p>
                                    </div>
                                    {notification.unread && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                      {notification.time}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {notification.unread && (
                                        <button
                                          onClick={() => markAsRead(notification.id)}
                                          className={`text-xs px-2 py-1 rounded ${darkMode ? "text-blue-400 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-100"}`}
                                        >
                                          Mark read
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className={`p-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <button className={`w-full text-center text-sm py-2 rounded-lg ${darkMode ? "text-blue-400 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-50"}`}>
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/dashboard/filmmaker/upload")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Movie
            </button>
          </div>
        </header>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}>
          <div className="p-6">
            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Account Summary Card */}
                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
                  <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    ACCOUNT SUMMARY
                  </h2>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Filmmaker Account
                      </h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Account ID: {dashboardData?.user?.id?.slice(-6) || "XXXXXX"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        RWF {formatCurrency(dashboardData?.finance?.availableBalance || 0)}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Available
                      </p>
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
                    <div key={i} className={`${darkMode ? "bg-gray-800 border-gray-700 hover:border-blue-500/50" : "bg-white border-gray-200 hover:shadow-md"} border rounded-xl p-6 transition-all duration-200`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-600 mb-3`} />
                      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Summary */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Revenue Summary
                    </h3>
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center py-3 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          This Month
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          RWF {formatCurrency(dashboardData?.summary?.thisMonthRevenue || 0)}
                        </span>
                      </div>
                      <div className={`flex justify-between items-center py-3 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          This Year
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          RWF {formatCurrency(dashboardData?.summary?.thisYearRevenue || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          Total Earnings
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          RWF {formatCurrency(dashboardData?.summary?.totalRevenue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center py-3 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          Avg Views per Movie
                        </span>
                        <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {formatNumber(dashboardData?.summary?.avgViewsPerMovie || 0)}
                        </span>
                      </div>
                      <div className={`flex justify-between items-center py-3 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          Platform Fees
                        </span>
                        <span className="font-bold text-orange-600">
                          RWF {formatCurrency(dashboardData?.summary?.platformFee || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                          Account Status
                        </span>
                        <span className={`font-bold ${dashboardData?.approval?.status === "verified" || dashboardData?.approval?.status === "approved" ? "text-green-600" : "text-blue-600"}`}>
                          {(dashboardData?.approval?.status || "Pending")?.charAt(0).toUpperCase() + (dashboardData?.approval?.status || "Pending")?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {paymentMethod && (
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <Wallet className="w-5 h-5 text-blue-600" />
                      Payment Method
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Manage your payment methods to ensure timely payouts
                    </p>

                    {paymentMethod?.currentMethod ? (
                      <div className={`rounded-xl border shadow-sm p-5 mb-6 transition-all ${darkMode ? "bg-gray-900/40 border-gray-700" : "bg-white border-gray-200"}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${darkMode ? "bg-green-700/30" : "bg-green-100"}`}>
                              <CheckCircle className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                            </div>

                            <div>
                              <p className={`text-sm uppercase tracking-wide font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}>
                                Active Payment Method
                              </p>

                              <p className={`text-xl font-semibold capitalize ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {paymentMethod.currentMethod}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs px-3 py-1 rounded-full bg-green-600 text-white font-medium shadow-sm">
                            Verified
                          </span>
                        </div>

                        {/* PAYMENT DETAILS */}
                        <div className="mt-2 space-y-3 text-sm">
                          {/* MOMO */}
                          {paymentMethod.currentMethod === "momo" && paymentMethod.paymentDetails?.momo && (
                            <div>
                              <p className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Mobile Money Number
                              </p>
                              <p className={`font-mono text-base font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {paymentMethod.paymentDetails.momo}
                              </p>
                            </div>
                          )}

                          {/* BANK */}
                          {paymentMethod.currentMethod === "bank" && paymentMethod.paymentDetails?.allMethods?.bankDetails && (
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  Bank Name
                                </p>
                                <p className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                  {paymentMethod.paymentDetails.allMethods.bankDetails.bankName}
                                </p>
                              </div>

                              <div>
                                <p className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  Account Number
                                </p>
                                <p className={`font-mono font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                  **** {paymentMethod.paymentDetails.allMethods.bankDetails.accountNumber?.slice(-4)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border rounded-lg p-4 mb-4 flex items-start gap-3 transition-colors duration-200`}>
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className={`font-semibold ${darkMode ? "text-blue-400" : "text-blue-900"}`}>
                            No payment method configured
                          </p>
                          <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                            Add a payment method to receive payouts
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => navigate("/filmmaker/payment-method")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      {paymentMethod?.currentMethod ? "Update Payment Method" : "Add Payment Method"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOVIES SECTION */}
            {activeSection === "movies" && (
              <div>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      My Content Library
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {movies.filter(m => m.contentType === "movie").length} Movies
                        </span>
                      </div>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {movies.filter(m => m.contentType === "series").length} Series
                        </span>
                      </div>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {movies.length} total items
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/dashboard/filmmaker/upload")}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Movie
                    </button>
                  </div>
                </div>

                {movies.length === 0 ? (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-200"} p-12 text-center transition-colors duration-200`}>
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                      <Film className={`w-10 h-10 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Your content library is empty
                    </h3>
                    <p className={`mb-8 max-w-md mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Start by uploading your first movie or creating a series to build your content portfolio
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => navigate("/dashboard/filmmaker/upload")}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                      >
                        Upload First Movie
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((content) => {
                      const isMovie = content.contentType === "movie";
                      const isSeries = content.contentType === "series";
                      const revenue = content.totalRevenue || 0;
                      const views = content.totalViews || 0;
                      
                      return (
                        <div
                          key={content.id}
                          className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
                              : "bg-white border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          {/* Content Type Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                              isMovie 
                                ? "bg-blue-600 text-white" 
                                : isSeries 
                                ? "bg-purple-600 text-white" 
                                : "bg-gray-600 text-white"
                            }`}>
                              {isMovie ? "MOVIE" : isSeries ? "SERIES" : content.contentType?.toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Thumbnail/Poster */}
                          <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative">
                            {content.poster || content.backdrop ? (
                              <img
                                src={content.poster || content.backdrop}
                                alt={content.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-12 h-12 text-gray-600" />
                              </div>
                            )}
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Quick Stats on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="text-center p-4">
                                <div className="flex items-center justify-center gap-6 mb-4">
                                  <div className="text-center">
                                    <Eye className="w-6 h-6 text-white mx-auto mb-1" />
                                    <p className="text-white font-semibold">{formatNumber(views)}</p>
                                    <p className="text-white/80 text-xs">Views</p>
                                  </div>
                                  <div className="w-px h-12 bg-white/30"></div>
                                  <div className="text-center">
                                    <DollarSign className="w-6 h-6 text-white mx-auto mb-1" />
                                    <p className="text-white font-semibold">RWF {formatCurrency(revenue)}</p>
                                    <p className="text-white/80 text-xs">Revenue</p>
                                  </div>
                                </div>
                                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                                  View Analytics
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="p-5">
                            {/* Title and Status */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className={`font-bold text-lg truncate pr-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                  {content.title}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                  content.status === "approved" || content.status === "published"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : content.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : content.status === "rejected"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {content.status?.charAt(0).toUpperCase() + content.status?.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  Uploaded {formatDate(content.createdAt)}
                                </p>
                                <span className="text-white text-lg font-bold">
                                  {content.currency}{content.viewPrice === 0 ? "FREE" : null} {formatCurrency(content.viewPrice)}
                                </span>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              {isMovie && (
                                <>
                                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                    <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      Duration
                                    </p>
                                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {formatDuration(content.videoDuration)}
                                    </p>
                                  </div>
                                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                    <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      Quality
                                    </p>
                                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {content.quality || "HD"}
                                    </p>
                                  </div>
                                </>
                              )}
                              
                              {isSeries && (
                                <>
                                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                    <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      Seasons
                                    </p>
                                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {content.totalSeasons || 1}
                                    </p>
                                  </div>
                                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                    <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      Episodes
                                    </p>
                                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {content.totalEpisodes || content.episodes?.length || 0}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isSeries) {
                                    handleViewSeriesEpisodes(content.id);
                                  } else {
                                    handleViewContentAnalytics(content);
                                  }
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg"
                              >
                                {isSeries ? "Manage Episodes" : "View Analytics"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleManageContent(content);
                                }}
                                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                                  darkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:shadow-lg"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg"
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                 handleDeleteMovie(content)
                                }}
                                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                                  darkMode
                                    ? "bg-red-900 hover:bg-red-800 text-red-300 hover:shadow-lg"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 hover:shadow-lg"
                                }`}
                              >
                                Delete
                              </button>
                            </div>

                            {/* Episode Preview for Series */}
                            {isSeries && content.episodes && content.episodes.length > 0 && (
                              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Recent Episodes
                                  </p>
                                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    {content.episodes.length} total
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {content.episodes.slice(0, 2).map((episode, index) => (
                                    <div
                                      key={episode.id}
                                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                                        index === 0 ? "bg-gray-50 dark:bg-gray-700/30" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/filmmaker/episodes/${episode.id}/edit`);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                          <span className="text-xs font-semibold">
                                            S{episode.seasonNumber || 1}E{episode.episodeNumber || 1}
                                          </span>
                                        </div>
                                        <div>
                                          <p className={`text-sm font-medium truncate max-w-[120px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            {episode.title}
                                          </p>
                                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            {formatCurrency(episode.viewPrice || 0)} {episode.currency}
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronRight className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                                    </div>
                                  ))}
                                  {content.episodes.length > 2 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewSeriesEpisodes(content.id);
                                      }}
                                      className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-2"
                                    >
                                      View all {content.episodes.length - 2} more episodes
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* EARNINGS SECTION */}
            {activeSection === "earnings" && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Earnings & Withdrawals
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <Wallet className="w-8 h-8 text-blue-600 mb-3" />
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Available Balance
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      RWF {formatCurrency(dashboardData?.finance?.availableBalance || 0)}
                    </p>
                  </div>
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <DollarSign className="w-8 h-8 text-green-600 mb-3" />
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Pending Payout
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      RWF {formatCurrency(dashboardData?.finance?.pendingBalance || 0)}
                    </p>
                  </div>
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Total Earned
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      RWF {formatCurrency(dashboardData?.finance?.totalEarned || 0)}
                    </p>
                  </div>
                </div>

                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Request Withdrawal
                  </h3>
                  <div className={`${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border rounded-lg p-4 mb-6 transition-colors duration-200`}>
                    <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-900"}`}>
                      ⚠️ Minimum withdrawal: RWF 50 | Processing time: 5-7 business days
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/filmmaker/withdrawal-request")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Request Withdrawal
                  </button>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeSection === "analytics" && (
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-12 text-center transition-colors duration-200`}>
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Analytics Dashboard
                </h3>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Detailed analytics and insights coming soon
                </p>
              </div>
            )}

            {/* PAYMENT NOTIFICATIONS SECTION */}
            {activeSection === "history" && (
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Payment History
                </h3>

                {loadingHistory && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {errorHistory && (
                  <div className={`p-4 mb-4 rounded-lg ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {errorHistory}
                  </div>
                )}

                {!loadingHistory && !errorHistory && paymentHistory?.length === 0 && (
                  <div className="text-center py-12">
                    <History className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                    <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                      No payment history available.
                    </p>
                  </div>
                )}

                {!loadingHistory && !errorHistory && paymentHistory?.length > 0 && (
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className={`${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} p-4 rounded-lg transition-colors duration-200 border ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {payment.movie?.title || "Unknown Movie"}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  payment.paymentStatus === "succeeded"
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-500"
                                    : payment.paymentStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/15 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/15 dark:text-red-400"
                                }`}
                              >
                                {payment.paymentStatus?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <span className="font-medium">Method:</span> <span className="bg-yellow-500/15 text-yellow-500 px-4 py-1 rounded-full">{payment.paymentMethod}</span>
                              </p>
                              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <span className="font-medium">Date:</span> {formatDateTime(payment.paymentDate)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:text-right">
                            <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {payment.currency} {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS SECTION */}
            {activeSection === "documents" && (
              <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-12 text-center transition-colors duration-200`}>
                <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Documents
                </h3>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Your contracts, invoices, and statements
                </p>
              </div>
            )}

            {/* SETTINGS SECTION */}
            {activeSection === "settings" && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Settings
                </h2>

                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Account Settings
                  </h3>
                  <div className="space-y-2">
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
                        Profile Information
                      </span>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
                        Security & Password
                      </span>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
                        Notification Preferences
                      </span>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    </button>
                  </div>
                </div>

                {/* Theme Settings */}
                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                        Theme
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {darkMode ? "Dark mode is enabled" : "Light mode is enabled"}
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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