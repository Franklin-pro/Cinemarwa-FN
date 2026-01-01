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
  Trash2,
  MessageSquare,
  Zap,
  Star,
  ExternalLink,
  Trash,
  MoreVertical,
} from "lucide-react";
import { filmmmakerService } from "../../services/api/filmmaker";
import cinemaLoaiding from "../../assets/cinemarwandaLoading.png";
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
  const [analytics, setAnalytics] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Add state for notification popover
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add ref for popover
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile && showMobileSidebar) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector("aside");
        if (sidebar && !sidebar.contains(event.target)) {
          setShowMobileSidebar(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobile, showMobileSidebar]);

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

  // Sidebar toggle for mobile
  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Navigation handler with mobile sidebar close
  const handleNavigation = (sectionId) => {
    if (sectionId === "upload") {
      navigate("/dashboard/filmmaker/upload");
    } else if (sectionId === "payment") {
      navigate("/filmmaker/payment-method");
    } 
    // else if (sectionId === "withdrawals") {
    //   navigate("/filmmaker/withdrawal-request");
    // }
     else {
      setActiveSection(sectionId);
    }
    
    // Close mobile sidebar after navigation
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  // Add notification handlers
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Only mark as read if there are notifications
    if (!showNotifications && notifications && notifications.length > 0) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    if (notifications && notifications.length > 0) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
    }
  };
  
  const unreadCount = notifications
    ? notifications.filter((n) => n.unread).length
    : 0;

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, moviesRes, statsRes, notificationsRes, analyticsRes, paymentRes] =
        await Promise.all([
          filmmmakerService.getDashboard(),
          filmmmakerService.getMovies(),
          filmmmakerService.getStats(),
          filmmmakerService.getNotifications(),
          filmmmakerService.getFilmmakerAnalytics(),
          filmmmakerService.getPaymentMethod(),
        ]);

      const dashboardInfo = dashboardRes.data.data;
      const moviesList = moviesRes.data?.data.movies || [];
      const statsInfo = statsRes.data;
      const paymentInfo = paymentRes.data;
      const analyticsInfo = analyticsRes.data.data;

      // FIXED: Handle notifications response correctly
      const notificationsResponse = notificationsRes.data;
      let notificationData = [];
      
      if (notificationsResponse?.success) {
        // Your response structure: {"success":true,"data":{"total":3,"notifications":[ ... ]}}
        if (notificationsResponse.data?.notifications) {
          notificationData = notificationsResponse.data.notifications.map(notif => ({
            id: notif.referenceId || Date.now() + Math.random(), // Create unique ID if none exists
            type: notif.type || "info",
            action: notif.action || "info",
            title: notif.title || "Notification",
            message: notif.message || "",
            date: notif.date || new Date().toISOString(),
            unread: true, // Mark all as unread initially
            // Add icon based on type
            icon: notif.type === "approval" ? CheckCircle : 
                  notif.type === "content" ? Film : 
                  Bell
          }));
        }
      }

      setDashboardData(dashboardInfo);
      setMovies(moviesList);
      setStats(statsInfo);
      setPaymentMethod(paymentInfo.data);
      setAnalytics(analyticsInfo);
      setNotifications(notificationData);
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
          setMovies((prevMovies) =>
            prevMovies.filter(
              (m) => m.id !== (movieToDelete.id || movieToDelete._id)
            )
          );
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
        if (parsedUser.id || parsedUser._id)
          return parsedUser.id || parsedUser._id;
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

  const handleViewSeriesEpisodes = (seriesId) => {
    navigate(`/filmmaker/series/${seriesId}/episodes`);
    if (isMobile) setShowMobileSidebar(false);
  };

  const handleManageContent = (content) => {
    if (content.contentType === "series") {
      navigate(`/filmmaker/series/${content.id}/edit`);
    } else if (content.contentType === "movie") {
      navigate(`/admin/movies/${content.id}/edit`);
    } else if (content.contentType === "episode") {
      navigate(`/filmmaker/episodes/${content.id}/edit`);
    }
    if (isMobile) setShowMobileSidebar(false);
  };

  const handleViewContentAnalytics = (content) => {
    if (content.contentType === "series") {
      navigate(`/filmmaker/series/${content.id}/analytics`);
    } else {
      navigate(`/admin/movies/${content.id}/analytics`);
    }
    if (isMobile) setShowMobileSidebar(false);
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
    // { id: "withdrawals", label: "Withdrawal History", icon: History },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex flex-col items-center justify-center transition-colors duration-200`}
      >
        <img
          src={cinemaLoaiding}
          alt="Loading..."
          className="w-32 h-32 animate-pulse"
        />
        <p className="mt-4 text-lg font-semibold text-yellow-500 animate-bounce">
          Loading movies...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center transition-colors duration-200`}
      >
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
    {
      icon: Film,
      label: "Total Movies",
      value: dashboardData?.summary?.totalMovies || stats?.totalMovies || "0",
      color: "blue",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatNumber(
        dashboardData?.summary?.totalViews || stats?.totalViews || 0
      ),
      color: "blue",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `RWF ${formatCurrency(
        dashboardData?.summary?.filmmmakerEarnings ||
          stats?.filmmmakerEarnings ||
          0
      )}`,
      color: "green",
    },
    {
      icon: Download,
      label: "Total Downloads",
      value: formatNumber(
        dashboardData?.summary?.totalDownloads || stats?.totalDownloads || 0
      ),
      color: "orange",
    },
  ];

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } overflow-hidden transition-colors duration-200`}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 md:z-auto h-full ${
          isMobile
            ? showMobileSidebar
              ? "translate-x-0"
              : "-translate-x-full"
            : sidebarOpen
            ? "w-64"
            : "w-20"
        } ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* Logo/Header */}
        <div
          className={`h-16 flex items-center justify-between px-4 ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } border-b`}
        >
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span
                className={`font-bold text-lg ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <a href="/"> Dashboard</a>
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } rounded-lg transition-colors`}
          >
            {isMobile ? (
              <X
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              />
            ) : sidebarOpen ? (
              <X
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              />
            ) : (
              <Menu
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              />
            )}
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
                  onClick={() => handleNavigation(item.id)}
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
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-blue-600"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  {(sidebarOpen || isMobile) && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* LogOut */}
        <div
          className={`${
            darkMode ? "border-gray-700" : "border-gray-200"
          } border-t p-4`}
        >
          <button
            onClick={() => {
              handleLogout();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LogOut
              className={`w-5 h-5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            {(sidebarOpen || isMobile) && <span>Log Out</span>}
          </button>
        </div>

        {/* User Profile */}
        <div
          className={`${
            darkMode ? "border-gray-700" : "border-gray-200"
          } border-t p-4`}
        >
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && !isMobile && "justify-center"
            }`}
          >
            <div className="w-10 h-10 uppercase bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userInfo?.name?.charAt(0) || "F"}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex-1">
                <p
                  className={`text-sm font-medium truncate ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userInfo?.name || "Filmmaker"}
                </p>
                <p
                  className={`text-xs truncate ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {userInfo?.email || "filmmaker@example.com"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Delete Modal */}
        {showDeleteModal && movieToDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              className={`max-w-md w-full rounded-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-red-900/30" : "bg-red-100"
                  }`}
                >
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delete Movie
                </h3>
              </div>

              <p
                className={`mb-6 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{movieToDelete.title}"</span>?
                This action cannot be undone and all associated data will be
                permanently removed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMovieToDelete(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
        <header
          className={`h-16 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b flex items-center justify-between px-4 sm:px-6 flex-shrink-0 transition-colors duration-200`}
        >
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <Menu
                  className={`w-5 h-5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              </button>
            )}
            <div>
              <h1
                className={`text-lg sm:text-xl md:text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {sidebarItems.find((item) => item.id === activeSection)?.label ||
                  "Dashboard"}
              </h1>
              {isMobile && (
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {sidebarItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications Bell with Popover */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={toggleNotifications}
                className={`relative p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <Bell
                  className={`w-5 h-5 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Popover - Responsive positioning */}
              {showNotifications && (
                <div
                  ref={notificationRef}
                  className={`absolute right-0 mt-2 w-screen sm:w-96 max-w-[calc(100vw-2rem)] ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-xl shadow-2xl border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } z-50 transition-all duration-200 transform origin-top-right`}
                  style={{
                    maxHeight: "calc(100vh - 100px)",
                    overflowY: "auto"
                  }}
                >
                  {/* Header */}
                  <div
                    className={`p-4 border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-bold text-lg ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className={`text-xs px-3 py-1 rounded-full ${
                              darkMode
                                ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className={`text-xs px-3 py-1 rounded-full ${
                              darkMode
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : "All caught up!"}
                    </p>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {!notifications || notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell
                          className={`w-12 h-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }
                        >
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => {
                          const Icon = notification.icon || Bell;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 hover:${
                                darkMode ? "bg-gray-700/50" : "bg-gray-50"
                              } transition-colors ${
                                notification.unread
                                  ? darkMode
                                    ? "bg-blue-900/10"
                                    : "bg-blue-50/50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    notification.type === "success"
                                      ? darkMode
                                        ? "bg-green-900/30"
                                        : "bg-green-100"
                                      : notification.type === "warning"
                                      ? darkMode
                                        ? "bg-yellow-900/30"
                                        : "bg-yellow-100"
                                      : notification.type === "info"
                                      ? darkMode
                                        ? "bg-blue-900/30"
                                        : "bg-blue-100"
                                      : darkMode
                                      ? "bg-gray-700"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <Icon
                                    className={`w-4 h-4 ${
                                      notification.type === "success"
                                        ? "text-green-600 dark:text-green-400"
                                        : notification.type === "warning"
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : notification.type === "info"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                      <h4
                                        className={`font-semibold truncate ${
                                          darkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {notification.title}
                                      </h4>
                                      <p
                                        className={`text-sm mt-1 break-words ${
                                          darkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {notification.message}
                                      </p>
                                      <p className="text-gray-300 text-xs pt-2">{formatDate(notification.date)}</p>
                                    </div>
                                    {notification.unread && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></div>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
                                    <span
                                      className={`text-xs ${
                                        darkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {notification.time}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {notification.unread && (
                                        <button
                                          onClick={() =>
                                            markAsRead(notification.id)
                                          }
                                          className={`text-xs px-2 py-1 rounded ${
                                            darkMode
                                              ? "text-blue-400 hover:bg-blue-900/30"
                                              : "text-blue-600 hover:bg-blue-100"
                                          }`}
                                        >
                                          Mark read
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          deleteNotification(notification.id)
                                        }
                                        className={`p-1 rounded text-red-500 ${
                                          darkMode
                                            ? "hover:bg-gray-700"
                                            : "hover:bg-gray-200"
                                        }`}
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
                    <div
                      className={`p-3 border-t ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <button
                        className={`w-full text-center text-sm py-2 rounded-lg ${
                          darkMode
                            ? "text-blue-400 hover:bg-blue-900/30"
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload Button - Responsive */}
            <button
              onClick={() => navigate("/dashboard/filmmaker/upload")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Movie</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </header>

        {/* Content Area - Scrollable */}
        <div
          className={`flex-1 overflow-y-auto ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          } transition-colors duration-200`}
        >
          <div className="p-4 sm:p-6">
            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Account Summary Card */}
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-200`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ACCOUNT SUMMARY
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h3
                        className={`text-base sm:text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Filmmaker Account
                      </h3>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Account ID:{" "}
                        {dashboardData?.user?.id?.slice(-6) || "XXXXXX"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        RWF{" "}
                        {formatCurrency(
                          dashboardData?.finance?.availableBalance || 0
                        )}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
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
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {statCards.map((stat, i) => (
                    <div
                      key={i}
                      className={`${
                        darkMode
                          ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
                          : "bg-white border-gray-200 hover:shadow-md"
                      } border rounded-xl p-4 sm:p-6 transition-all duration-200`}
                    >
                      <stat.icon
                        className={`w-6 sm:w-8 h-6 sm:h-8 text-${stat.color}-600 mb-2 sm:mb-3`}
                      />
                      <p
                        className={`text-xs sm:text-sm mb-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {stat.label}
                      </p>
                      <p
                        className={`text-lg sm:text-xl md:text-2xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Revenue Summary */}
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
                  >
                    <h3
                      className={`text-base sm:text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                      Revenue Summary
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div
                        className={`flex justify-between items-center py-2 sm:py-3 ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } border-b`}
                      >
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          This Month
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">
                          RWF{" "}
                          {formatCurrency(
                            dashboardData?.summary?.thisMonthRevenue || 0
                          )}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between items-center py-2 sm:py-3 ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } border-b`}
                      >
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          This Year
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">
                          RWF{" "}
                          {formatCurrency(
                            dashboardData?.summary?.thisYearRevenue || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          Total Earnings
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          RWF{" "}
                          {formatCurrency(
                            dashboardData?.summary?.totalRevenue || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
                  >
                    <h3
                      className={`text-base sm:text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div
                        className={`flex justify-between items-center py-2 sm:py-3 ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } border-b`}
                      >
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          Avg Views per Movie
                        </span>
                        <span
                          className={`font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatNumber(
                            dashboardData?.summary?.avgViewsPerMovie || 0
                          )}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between items-center py-2 sm:py-3 ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } border-b`}
                      >
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          Platform Fees
                        </span>
                        <span className="font-bold text-orange-600">
                          RWF{" "}
                          {formatCurrency(
                            dashboardData?.summary?.platformFee || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          Account Status
                        </span>
                        <span
                          className={`font-bold ${
                            dashboardData?.approval?.status === "verified" ||
                            dashboardData?.approval?.status === "approved"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {(dashboardData?.approval?.status || "Pending")
                            ?.charAt(0)
                            .toUpperCase() +
                            (
                              dashboardData?.approval?.status || "Pending"
                            )?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {paymentMethod && (
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
                  >
                    <h3
                      className={`text-base sm:text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                      Payment Method
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mb-4 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Manage your payment methods to ensure timely payouts
                    </p>

                    {paymentMethod?.currentMethod ? (
                      <div
                        className={`rounded-xl border shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 transition-all ${
                          darkMode
                            ? "bg-gray-900/40 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                darkMode ? "bg-green-700/30" : "bg-green-100"
                              }`}
                            >
                              <CheckCircle
                                className={`w-4 sm:w-5 h-4 sm:h-5 ${
                                  darkMode ? "text-green-400" : "text-green-600"
                                }`}
                              />
                            </div>

                            <div>
                              <p
                                className={`text-xs sm:text-sm uppercase tracking-wide font-bold ${
                                  darkMode ? "text-green-300" : "text-green-700"
                                }`}
                              >
                                Active Payment Method
                              </p>

                              <p
                                className={`text-lg sm:text-xl font-semibold capitalize ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {paymentMethod.currentMethod}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs px-3 py-1 rounded-full bg-green-600 text-white font-medium shadow-sm self-start sm:self-auto">
                            Verified
                          </span>
                        </div>

                        {/* PAYMENT DETAILS */}
                        <div className="mt-2 space-y-3 text-sm">
                          {/* MOMO */}
                          {paymentMethod.currentMethod === "momo" &&
                            paymentMethod.paymentDetails?.momo && (
                              <div>
                                <p
                                  className={`text-xs uppercase tracking-wide mb-1 ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Mobile Money Number
                                </p>
                                <p
                                  className={`font-mono text-sm sm:text-base font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-800"
                                  }`}
                                >
                                  {paymentMethod.paymentDetails.momo}
                                </p>
                              </div>
                            )}

                          {/* BANK */}
                          {paymentMethod.currentMethod === "bank" &&
                            paymentMethod.paymentDetails?.allMethods
                              ?.bankDetails && (
                              <div className="space-y-3">
                                <div>
                                  <p
                                    className={`text-xs uppercase tracking-wide mb-1 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Bank Name
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {
                                      paymentMethod.paymentDetails.allMethods
                                        .bankDetails.bankName
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p
                                    className={`text-xs uppercase tracking-wide mb-1 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Account Number
                                  </p>
                                  <p
                                    className={`font-mono font-medium ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    ****{" "}
                                    {paymentMethod.paymentDetails.allMethods.bankDetails.accountNumber?.slice(
                                      -4
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`${
                          darkMode
                            ? "bg-blue-900/20 border-blue-800"
                            : "bg-blue-50 border-blue-200"
                        } border rounded-lg p-4 mb-4 flex items-start gap-3 transition-colors duration-200`}
                      >
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-blue-400" : "text-blue-900"
                            }`}
                          >
                            No payment method configured
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-blue-300" : "text-blue-700"
                            }`}
                          >
                            Add a payment method to receive payouts
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => navigate("/filmmaker/payment-method")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      {paymentMethod?.currentMethod
                        ? "Update Payment Method"
                        : "Add Payment Method"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOVIES SECTION */}
            {activeSection === "movies" && (
              <div>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <h2
                      className={`text-xl sm:text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      My Content Library
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {
                            movies.filter((m) => m.contentType === "movie")
                              .length
                          }{" "}
                          Movies
                        </span>
                      </div>
                      <div className="w-px h-3 sm:h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {
                            movies.filter((m) => m.contentType === "series")
                              .length
                          }{" "}
                          Series
                        </span>
                      </div>
                      <div className="w-px h-3 sm:h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <span
                        className={`text-xs sm:text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {movies.length} total items
                      </span>
                    </div>
                  </div>
                </div>

                {movies.length === 0 ? (
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } p-8 sm:p-12 text-center transition-colors duration-200`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-full flex items-center justify-center">
                      <Film
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Your content library is empty
                    </h3>
                    <p
                      className={`mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Start by uploading your first movie or creating a series
                      to build your content portfolio
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <button
                        onClick={() => navigate("/dashboard/filmmaker/upload")}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base"
                      >
                        Upload First Movie
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                            <span
                              className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold tracking-wide ${
                                isMovie
                                  ? "bg-blue-600 text-white"
                                  : isSeries
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {isMovie
                                ? "MOVIE"
                                : isSeries
                                ? "SERIES"
                                : content.contentType?.toUpperCase()}
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
                                <Film className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                              </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Quick Stats on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="text-center p-4">
                                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
                                  <div className="text-center">
                                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-1" />
                                    <p className="text-white font-semibold text-sm sm:text-base">
                                      {formatNumber(views)}
                                    </p>
                                    <p className="text-white/80 text-xs">
                                      Views
                                    </p>
                                  </div>
                                  <div className="w-px h-8 sm:h-12 bg-white/30"></div>
                                  <div className="text-center">
                                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-1" />
                                    <p className="text-white font-semibold text-sm sm:text-base">
                                      RWF {formatCurrency(revenue)}
                                    </p>
                                    <p className="text-white/80 text-xs">
                                      Revenue
                                    </p>
                                  </div>
                                </div>
                                <button className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors">
                                  View Analytics
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="p-3 sm:p-5">
                            {/* Title and Status */}
                            <div className="mb-3 sm:mb-4">
                              <div className="flex items-start justify-between mb-1 sm:mb-2">
                                <h3
                                  className={`font-bold text-base sm:text-lg truncate pr-2 ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {content.title}
                                </h3>
                                <span
                                  className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium whitespace-nowrap ${
                                    content.status === "approved" ||
                                    content.status === "published"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : content.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : content.status === "rejected"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                  }`}
                                >
                                  {content.status?.charAt(0).toUpperCase() +
                                    content.status?.slice(1)}
                                </span>
                              </div>
                              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-2">
                                <p
                                  className={`text-xs sm:text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  uploaded {formatDate(content.createdAt)}
                                </p>
                                <span className="text-white text-xs sm:text-sm font-bold">
                                  RWF
                                  {content.viewPrice === 0 ? "FREE" : null}{" "}
                                  {formatCurrency(content.viewPrice)}
                                </span>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                              {isMovie && (
                                <>
                                  <div
                                    className={`text-center p-2 sm:p-3 rounded-lg ${
                                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                                    }`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Duration
                                    </p>
                                    <p
                                      className={`font-semibold text-sm sm:text-base ${
                                        darkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {formatDuration(content.videoDuration)}
                                    </p>
                                  </div>
                                  <div
                                    className={`text-center p-2 sm:p-3 rounded-lg ${
                                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                                    }`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Quality
                                    </p>
                                    <p
                                      className={`font-semibold text-sm sm:text-base ${
                                        darkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {content.quality || "HD"}
                                    </p>
                                  </div>
                                </>
                              )}

                              {isSeries && (
                                <>
                                  <div
                                    className={`text-center p-2 sm:p-3 rounded-lg ${
                                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                                    }`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Seasons
                                    </p>
                                    <p
                                      className={`font-semibold text-sm sm:text-base ${
                                        darkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {content.totalSeasons || 1}
                                    </p>
                                  </div>
                                  <div
                                    className={`text-center p-2 sm:p-3 rounded-lg ${
                                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                                    }`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Episodes
                                    </p>
                                    <p
                                      className={`font-semibold text-sm sm:text-base ${
                                        darkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {content.totalEpisodes ||
                                        content.episodes?.length ||
                                        0}
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
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-lg"
                              >
                                {isSeries
                                  ? "Manage Episodes"
                                  : "Analytics"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleManageContent(content);
                                }}
                                className={`px-2 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
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
                                  handleDeleteMovie(content);
                                }}
                                className={`px-2 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                                  darkMode
                                    ? "bg-red-900 hover:bg-red-800 text-red-300 hover:shadow-lg"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 hover:shadow-lg"
                                }`}
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Episode Preview for Series */}
                            {isSeries &&
                              content.episodes &&
                              content.episodes.length > 0 && (
                                <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <p
                                      className={`text-xs sm:text-sm font-semibold ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Recent Episodes
                                    </p>
                                    <span
                                      className={`text-xs ${
                                        darkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {content.episodes.length} total
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {content.episodes
                                      .slice(0, 2)
                                      .map((episode, index) => (
                                        <div
                                          key={episode.id}
                                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                                            index === 0
                                              ? "bg-gray-50 dark:bg-gray-700/30"
                                              : ""
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                              `/filmmaker/episodes/${episode.id}/edit`
                                            );
                                          }}
                                        >
                                          <div className="flex items-center gap-2 sm:gap-3">
                                            <div
                                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                                                darkMode
                                                  ? "bg-gray-700"
                                                  : "bg-gray-100"
                                              }`}
                                            >
                                              <span className="text-xs font-semibold">
                                                S{episode.seasonNumber || 1}E
                                                {episode.episodeNumber || 1}
                                              </span>
                                            </div>
                                            <div className="min-w-0">
                                              <p
                                                className={`text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-[120px] ${
                                                  darkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {episode.title}
                                              </p>
                                              <p
                                                className={`text-xs ${
                                                  darkMode
                                                    ? "text-gray-500"
                                                    : "text-gray-400"
                                                }`}
                                              >
                                                {formatCurrency(
                                                  episode.viewPrice || 0
                                                )}{" "}
                                                {episode.currency}
                                              </p>
                                            </div>
                                          </div>
                                          <ChevronRight
                                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                              darkMode
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                      ))}
                                    {content.episodes.length > 2 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewSeriesEpisodes(content.id);
                                        }}
                                        className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium py-1.5 sm:py-2"
                                      >
                                        View all {content.episodes.length - 2}{" "}
                                        more episodes
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
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Earnings & Payouts
                    </h2>
                    <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Automatic payout system - Funds are paid directly to your MoMo
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                    <span className={`font-semibold text-xs sm:text-sm ${darkMode ? "text-green-400" : "text-green-700"}`}>
                      🚀 AUTOMATIC PAYOUTS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Total Earned Card */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total Earned
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                          RWF {formatCurrency(analytics?.summary?.totalNetReceived || 0)}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                        <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Lifetime earnings from all content
                    </p>
                  </div>

                  {/* Total Received Card */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total Received
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                          RWF {formatCurrency(dashboardData?.finance?.totalEarned || 0)}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                        <Wallet className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                      </div>
                    </div>
                    <p className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      In your MoMo account (after 6% fees)
                    </p>
                  </div>

                  {/* Automatic Payouts Card */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Automatic Payouts
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                          {analytics?.summary?.totalSales || 0}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                        <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Successful automatic payments
                    </p>
                  </div>
                </div>

                {/* Automatic Payout System Info */}
                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Automatic Payout System
                  </h3>
                  
                  <div className={`${darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"} border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 transition-colors duration-200`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm sm:text-base ${darkMode ? "text-green-400" : "text-green-900"}`}>
                          🎉 No Withdrawal Requests Needed!
                        </p>
                        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-green-300" : "text-green-700"}`}>
                          Your funds are automatically sent to your MoMo when users purchase your content.
                          The system splits payments instantly: 70% to you, 30% to admin.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* How It Works */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        How It Works
                      </h4>
                      <ul className="space-y-2 sm:space-y-3">
                        <li className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                            <span className="text-blue-600 text-xs font-bold">1</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            User purchases your content
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                            <span className="text-blue-600 text-xs font-bold">2</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Payment is split: 70% to you, 30% to admin
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                            <span className="text-blue-600 text-xs font-bold">3</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Funds sent directly to your MoMo (minus 6% gateway fee)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                            <span className="text-blue-600 text-xs font-bold">4</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Check "Payout History" for all automatic payments
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Payment Split Example */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Payment Split Example
                      </h4>
                      <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between mb-2 sm:mb-3">
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>User pays:</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">RWF 100</span>
                        </div>
                        <div className="flex justify-between mb-1.5 sm:mb-2">
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>→ Filmmaker (70%):</span>
                          <span className="font-bold text-green-600 text-sm sm:text-base">RWF 70</span>
                        </div>
                        <div className="flex justify-between mb-1.5 sm:mb-2">
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>→ Gateway fee (6%):</span>
                          <span className="font-bold text-orange-600 text-sm sm:text-base">-RWF 4.20</span>
                        </div>
                        <div className="flex justify-between mb-1.5 sm:mb-2">
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>→ You receive:</span>
                          <span className="font-bold text-green-600 text-sm sm:text-base">RWF 65.80</span>
                        </div>
                        <div className="flex justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className={`text-xs sm:text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>→ Admin (30%):</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">RWF 30</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Last automatic payout
                      </p>
                      <p className="text-sm font-medium">
                        {dashboardData?.finance?.lastWithdrawalDate 
                          ? formatDate(dashboardData.finance.lastWithdrawalDate)
                          : "No payments yet"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/filmmaker/payout-history")}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      View Payout History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeSection === "analytics" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Analytics Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Analytics Dashboard
                    </h2>
                    <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {analytics?.period?.label || "Last 30 days"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        {analytics?.period?.days || 30} days
                      </span>
                    </div>
                    <button
                      onClick={fetchDashboardData}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Total Content */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total Content
                        </p>
                        <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {analytics?.summary?.totalContent || 0}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                        <Film className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {analytics?.contentBreakdown?.byType?.movie?.count || 0} Movies • 
                      {analytics?.contentBreakdown?.byType?.series?.count || 0} Series
                    </div>
                  </div>

                  {/* Total Views */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total Views
                        </p>
                        <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {formatNumber(analytics?.summary?.totalViews || 0)}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                        <Eye className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {analytics?.averages?.viewsPerContent?.toFixed(0) || 0} avg per content
                    </div>
                  </div>

                  {/* Total Sales */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total Sales
                        </p>
                        <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-green-600`}>
                          {formatNumber(analytics?.summary?.totalSales || 0)}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                        <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                      </div>
                    </div>
                    <div className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {analytics?.summary?.conversionRate?.toFixed(2) || 0}% conversion rate
                    </div>
                  </div>

                  {/* Filmmaker Earnings */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Your Earnings
                        </p>
                        <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-green-600`}>
                          RWF {formatCurrency(analytics?.summary?.filmmakerEarnings || 0)}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                        <Wallet className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                      </div>
                    </div>
                    <div className={`text-xs mt-2 sm:mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      After all fees
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                  <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Revenue Breakdown
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Gross Revenue</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-2">
                          RWF {formatCurrency(analytics?.summary?.grossRevenue || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Gateway Fees (6%)</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mt-2">
                          RWF {formatCurrency(analytics?.summary?.gatewayFees || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>After Gateway Fee</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 mt-2">
                          RWF {formatCurrency(analytics?.summary?.netRevenue || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Platform Fee (30%)</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-2">
                          RWF {formatCurrency(analytics?.summary?.platformFee || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                      <div>
                        <p className={`font-semibold text-sm sm:text-base ${darkMode ? "text-green-400" : "text-green-700"}`}>
                          Your Share: 70%
                        </p>
                        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          Filmmaker Earnings (After all fees)
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                        RWF {formatCurrency(analytics?.summary?.filmmakerEarnings || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Growth & Averages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Growth Metrics */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Growth Metrics
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Revenue Growth</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`w-4 sm:w-5 h-4 sm:h-5 ${
                              analytics?.growth?.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                            }`} />
                            <span className={`text-lg sm:text-xl font-bold ${
                              analytics?.growth?.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {analytics?.growth?.revenueGrowth >= 0 ? "+" : ""}{analytics?.growth?.revenueGrowth?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs mt-1 sm:mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          vs previous period (RWF {formatCurrency(analytics?.growth?.previousPeriodRevenue || 0)})
                        </p>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Sales Growth</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`w-4 sm:w-5 h-4 sm:h-5 ${
                              analytics?.growth?.salesGrowth >= 0 ? "text-green-600" : "text-red-600"
                            }`} />
                            <span className={`text-lg sm:text-xl font-bold ${
                              analytics?.growth?.salesGrowth >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {analytics?.growth?.salesGrowth >= 0 ? "+" : ""}{analytics?.growth?.salesGrowth?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs mt-1 sm:mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          vs previous period ({analytics?.growth?.previousPeriodSales || 0} sales)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Averages */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Average Metrics
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Revenue per Sale</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600">
                            RWF {formatCurrency(analytics?.averages?.revenuePerSale || 0)}
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Views per Content</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600">
                            {analytics?.averages?.viewsPerContent?.toFixed(0) || 0}
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Revenue per Day</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600">
                            RWF {formatCurrency(analytics?.averages?.revenuePerDay || 0)}
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Sales per Day</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600">
                            {analytics?.averages?.salesPerDay?.toFixed(2) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Content */}
                {analytics?.topPerforming && (
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Top Performing Content
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* By Revenue */}
                      <div>
                        <h4 className={`text-sm font-semibold mb-3 sm:mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Top by Revenue
                        </h4>
                        <div className="space-y-2 sm:space-y-3">
                          {analytics.topPerforming.byRevenue?.slice(0, 5).map((content, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <span className="font-bold text-xs sm:text-sm">{index + 1}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-semibold text-xs sm:text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    {content.title}
                                  </p>
                                  <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {formatNumber(content.views)} views
                                  </span>
                                </div>
                              </div>
                              <p className="font-bold text-green-600 text-xs sm:text-sm">
                                RWF {formatCurrency(content.revenue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* By Views */}
                      <div>
                        <h4 className={`text-sm font-semibold mb-3 sm:mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Top by Views
                        </h4>
                        <div className="space-y-2 sm:space-y-3">
                          {analytics.topPerforming.byViews?.slice(0, 5).map((content, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <span className="font-bold text-xs sm:text-sm">{index + 1}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-semibold text-xs sm:text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    {content.title}
                                  </p>
                                  <span className={`text-xs text-green-600`}>
                                    RWF {formatCurrency(content.revenue)}
                                  </span>
                                </div>
                              </div>
                              <p className={`font-bold text-blue-600 text-xs sm:text-sm`}>
                                {formatNumber(content.views)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods & Audience */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Payment Methods */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Payment Methods
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {analytics?.paymentMethods?.map((method, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                              {method.method === "MoMo" ? "Mobile Money (MoMo)" : method.method}
                            </span>
                            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                              {method.percentage}% ({method.count} sales)
                            </span>
                          </div>
                          <div className={`w-full h-2 sm:h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                            <div 
                              className={`h-full rounded-full ${
                                method.method.toLowerCase().includes("momo") ? "bg-green-600" : 
                                method.method.toLowerCase().includes("card") ? "bg-blue-600" : 
                                "bg-blue-600"
                              }`}
                              style={{ width: `${method.percentage}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Total: RWF {formatCurrency(method.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audience Insights */}
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Audience Insights
                    </h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Unique Viewers
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                          {formatNumber(analytics?.summary?.uniqueViewers || 0)}
                        </p>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Conversion Rate
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                          {analytics?.summary?.conversionRate?.toFixed(2) || 0}%
                        </p>
                        <p className={`text-xs mt-1 sm:mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {analytics?.summary?.totalSales || 0} sales from {analytics?.summary?.totalViews || 0} views
                        </p>
                      </div>

                      <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <p className={`text-xs sm:text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Average Rating
                        </p>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-current" />
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                            {analytics?.summary?.avgRating?.toFixed(1) || "0.0"}
                          </p>
                          <span className={`text-base sm:text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>/ 5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className={`${darkMode ? "bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-800/30" : "bg-gradient-to-br from-green-50 to-blue-50 border-green-200"} border rounded-xl p-4 sm:p-6 transition-colors duration-200`}>
                  <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? "text-green-300" : "text-green-700"}`}>
                        Gross Pending Balance
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                        RWF {formatCurrency(analytics?.financialSummary?.grossPendingBalance || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? "text-green-300" : "text-green-700"}`}>
                        Available Balance
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                        RWF {formatCurrency(analytics?.financialSummary?.availableBalance || 0)}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        After 6% gateway fee
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                        Withdrawn Balance
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                        RWF {formatCurrency(analytics?.financialSummary?.withdrawnBalance || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                        Total Earned
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                        RWF {formatCurrency(analytics?.financialSummary?.totalEarned || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                {(!analytics || Object.keys(analytics).length === 0) && !loading && (
                  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl p-8 sm:p-12 text-center transition-colors duration-200`}>
                    <BarChart3 className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                    <h3 className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      No Analytics Data Yet
                    </h3>
                    <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Start uploading content to see detailed analytics and insights
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/filmmaker/upload")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                    >
                      Upload Your First Movie
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <div
                className={`${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div>
                    <h3
                      className={`text-lg sm:text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      All Notifications
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {notifications.length > 0 
                        ? `${notifications.filter(n => n.unread).length} unread out of ${notifications.length} total`
                        : "No notifications yet"}
                    </p>
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      {notifications.filter(n => n.unread).length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium ${
                            darkMode
                              ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          Mark All Read
                        </button>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium ${
                          darkMode
                            ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {loading && (
                  <div className="flex justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {error && (
                  <div
                    className={`p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg ${
                      darkMode
                        ? "bg-red-900/20 text-red-300"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    <span className="text-xs sm:text-sm">{error}</span>
                    <button
                      onClick={fetchDashboardData}
                      className="ml-2 sm:ml-4 underline hover:no-underline text-xs sm:text-sm"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <Bell
                      className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${
                        darkMode ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                    <h4
                      className={`text-base sm:text-lg font-bold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      All Caught Up!
                    </h4>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      You don't have any notifications at the moment.
                    </p>
                  </div>
                )}

                {!loading && !error && notifications.length > 0 && (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const Icon = notification.icon || Bell;
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                            darkMode
                              ? notification.unread
                                ? "bg-blue-900/10 border border-blue-800/30"
                                : "bg-gray-700/50 hover:bg-gray-700"
                              : notification.unread
                              ? "bg-blue-50/70 border border-blue-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                                notification.type === "success"
                                  ? darkMode
                                    ? "bg-green-900/30"
                                    : "bg-green-100"
                                  : notification.type === "warning"
                                  ? darkMode
                                    ? "bg-yellow-900/30"
                                    : "bg-yellow-100"
                                  : notification.type === "info"
                                  ? darkMode
                                    ? "bg-blue-900/30"
                                    : "bg-blue-100"
                                  : darkMode
                                  ? "bg-gray-700"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  notification.type === "success"
                                    ? "text-green-600 dark:text-green-400"
                                    : notification.type === "warning"
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : notification.type === "info"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4
                                  className={`font-bold text-sm sm:text-base ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {notification.unread && (
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className={`p-1 rounded-lg ${
                                      darkMode
                                        ? "hover:bg-gray-600"
                                        : "hover:bg-gray-200"
                                    }`}
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                              <p
                                className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-medium ${
                                    darkMode ? "text-gray-300" : "text-gray-400"
                                  }`}
                                >
                                  {notification.time || formatDate(notification.date) || "Recently"}
                                </span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {notification.unread && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className={`text-xs px-2 py-1 rounded-lg ${
                                        darkMode
                                          ? "text-blue-400 hover:bg-blue-900/30"
                                          : "text-blue-600 hover:bg-blue-100"
                                      }`}
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                  {notification.actionUrl && (
                                    <a
                                      href={notification.actionUrl}
                                      className={`text-xs px-2 py-1 rounded-lg ${
                                        darkMode
                                          ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                      }`}
                                    >
                                      View details
                                    </a>
                                  )}
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
            )}

            {/* SETTINGS SECTION */}
            {activeSection === "settings" && (
              <div className="space-y-4 sm:space-y-6">
                <h2
                  className={`text-xl sm:text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Settings
                </h2>

                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
                >
                  <h3
                    className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Settings
                  </h3>
                  <div className="space-y-2">
                    <button
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span
                        className={`text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        Profile Information
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                    <button
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span
                        className={`text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        Security & Password
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                    <button
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-between ${
                        darkMode
                          ? "hover:bg-gray-700 border-gray-700"
                          : "hover:bg-gray-50 border-gray-200"
                      } border`}
                    >
                      <span
                        className={`text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        Notification Preferences
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Theme Settings */}
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border rounded-xl p-4 sm:p-6 transition-colors duration-200`}
                >
                  <h3
                    className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Appearance
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p
                        className={`font-medium text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        Theme
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {darkMode
                          ? "Dark mode is enabled"
                          : "Light mode is enabled"}
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {darkMode ? (
                        <>
                          <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Switch to Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Switch to Dark</span>
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