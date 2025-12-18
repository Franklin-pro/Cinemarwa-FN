import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboard,
  fetchAnalytics,
  filmmakerPerformance,
  recentlyActivities,
  clearError,
  clearSuccessMessage,
} from '../../store/slices/adminSlice';
import { BarChart, Users, Film, AlertCircle, TrendingUp, Mail, Clock, Activity, TrendingUp as PerformanceIcon } from 'lucide-react';

// Admin Dashboard Tabs
import FilmmakerManagement from '../../components/admin/FilmmakerManagement';
import UserManagement from '../../components/admin/UserManagement';
import ContentModeration from '../../components/admin/ContentModeration';
import PaymentReconciliation from '../../components/admin/PaymentReconciliation';
import SubscriberManagement from '../../components/admin/SubscriberManagement';

// Analytics Charts Components
import {
  MetricsBarChart,
  RevenueChart,
  TopFilmmakersChart,
  FilmmakerActivityChart,
  AnalyticsSummary,
  FilmmakersSummaryTable,
} from '../../components/admin/AnalyticsCharts';
import { logoutAll } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { 
    dashboard, 
    analytics, 
    filmmakersPerformance,
    activities, // Add this to get activities data
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.admin);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [performancePeriod, setPerformancePeriod] = useState('month');
  const [activitiesPeriod, setActivitiesPeriod] = useState('week'); // Changed default to week
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutAll());
    navigate("/");
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      dispatch(fetchDashboard());
      dispatch(fetchAnalytics(analyticsPeriod));
    } else if (activeTab === 'activities') {
      dispatch(recentlyActivities(activitiesPeriod));
    } else if (activeTab === 'performance') {
      dispatch(filmmakerPerformance(performancePeriod));
    }
  }, [dispatch, activeTab, analyticsPeriod, activitiesPeriod, performancePeriod]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage platform, users, filmmakers, and content</p>
          </div>
          <div className="mt-4">
            <button onClick={handleLogout} className='bg-red-500 px-6 py-2 rounded-2xl hover:bg-red-600'>
              Sign-Out
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Navigation Tabs - UPDATED WITH NEW TABS */}
        <div className="mb-8 border-b border-gray-700 flex gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'activities', label: 'Activities', icon: Activity },
            { id: 'performance', label: 'Performance', icon: PerformanceIcon },
            { id: 'filmmakers', label: 'Filmmakers', icon: Film },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'subscribers', label: 'Subscribers', icon: Mail },
            { id: 'moderation', label: 'Content Moderation', icon: AlertCircle },
            { id: 'payments', label: 'Payments', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <OverviewTab
              dashboard={dashboard}
              analytics={analytics}
              analyticsPeriod={analyticsPeriod}
              setAnalyticsPeriod={setAnalyticsPeriod}
              loading={loading}
            />
          )}
          {activeTab === 'activities' && (
            <ActivitiesTab
              activities={activities}
              activitiesPeriod={activitiesPeriod}
              setActivitiesPeriod={setActivitiesPeriod}
              loading={loading}
            />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab
              filmmakersPerformance={filmmakersPerformance}
              performancePeriod={performancePeriod}
              setPerformancePeriod={setPerformancePeriod}
              loading={loading}
            />
          )}
          {activeTab === 'filmmakers' && <FilmmakerManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'subscribers' && <SubscriberManagement />}
          {activeTab === 'moderation' && <ContentModeration />}
          {activeTab === 'payments' && <PaymentReconciliation />}
        </div>
      </div>
    </div>
  );
}

// =============== OVERVIEW TAB ===============
function OverviewTab({ 
  dashboard, 
  analytics,
  analyticsPeriod, 
  setAnalyticsPeriod,
  loading 
}) {
  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const stats = dashboard?.stats || dashboard || {};
  const analyticsData = analytics?.stats || analytics || {};

  const totalUsers = stats?.users?.total ?? 0;
  const totalFilmmakers = stats?.users?.filmmakers ?? 0;
  const totalMovies = stats?.content?.totalMovies ?? 0;
  const userGrowth = stats.userGrowth || 0;
  const filmmakersGrowth = stats.filmmakersGrowth || 0;
  const moviesGrowth = stats.moviesGrowth || 0;

  // Extract period data
  const periodData = analytics?.period ? analytics : analyticsData;
  const metrics = periodData?.metrics || analyticsData?.metrics || {};

  return (
    <div className="space-y-8">
      {/* Key Metrics - All Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={typeof totalUsers === 'number' ? totalUsers.toLocaleString() : 0}
          change={userGrowth}
          icon="👥"
        />
        <MetricCard
          title="Total Filmmakers"
          value={typeof totalFilmmakers === 'number' ? totalFilmmakers.toLocaleString() : 0}
          change={filmmakersGrowth}
          icon="🎬"
        />
        <MetricCard
          title="Total Movies"
          value={typeof totalMovies === 'number' ? totalMovies.toLocaleString() : 0}
          change={moviesGrowth}
          icon="🎥"
        />
      </div>

      {/* Analytics Period Selector */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Period Analytics - {analyticsPeriod}</h2>
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Analytics Summary Cards */}
        {analytics && (
          <>
            <AnalyticsSummary data={analytics} period={analyticsPeriod} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <MetricsBarChart
                period={analyticsPeriod}
                metrics={analytics?.metrics || metrics}
              />
              <RevenueChart
                revenue={analytics?.metrics?.revenue || metrics?.revenue || 0}
                platformEarnings={analytics?.metrics?.platformEarnings || metrics?.platformEarnings || 0}
                period={analyticsPeriod}
              />
            </div>
          </>
        )}
      </div>

      {/* Platform Statistics Summary */}
      {stats.totalActiveUsers !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsBox
            label="Active Users"
            value={stats.totalActiveUsers || 0}
            subtext="Currently online"
          />
          <StatsBox
            label="Pending Approvals"
            value={stats.pendingApprovals || 0}
            subtext="Awaiting review"
          />
          <StatsBox
            label="Total Transactions"
            value={stats.totalTransactions || 0}
            subtext="All time"
          />
        </div>
      )}
    </div>
  );
}

// =============== ACTIVITIES TAB ===============
function ActivitiesTab({ 
  activities,
  activitiesPeriod,
  setActivitiesPeriod,
  loading 
}) {
  // Format activity timestamp
  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'login':
        return '🔐';
      case 'signup':
        return '👤';
      case 'movie_upload':
        return '🎬';
      case 'movie_view':
        return '👁️';
      case 'payment':
        return '💰';
      case 'approval':
        return '✅';
      case 'review':
        return '⭐';
      default:
        return '📝';
    }
  };

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'signup':
        return 'bg-green-500/20 text-green-400';
      case 'movie_upload':
        return 'bg-blue-500/20 text-blue-400';
      case 'payment':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'approval':
        return 'bg-teal-500/20 text-teal-400';
      case 'block':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  // Get activity badge label
  const getActivityBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'signup':
        return 'New User';
      case 'movie_upload':
        return 'Movie Upload';
      case 'payment':
        return 'Payment';
      case 'approval':
        return 'Approval';
      case 'block':
        return 'Blocked';
      default:
        return 'Activity';
    }
  };

  if (loading && !activities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Activities Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Recent Activities - {activitiesPeriod}</h2>
          </div>
          <select
            value={activitiesPeriod}
            onChange={(e) => setActivitiesPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Activities Stats */}
        {activities?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Activities</p>
              <p className="text-2xl font-bold">{activities.summary.totalActivities || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Active Users</p>
              <p className="text-2xl font-bold">{activities.summary.activeUsers || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Movie Views</p>
              <p className="text-2xl font-bold">{activities.summary.movieViews || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">New Uploads</p>
              <p className="text-2xl font-bold">{activities.summary.newUploads || 0}</p>
            </div>
          </div>
        )}

        {/* Activity Type Breakdown */}
        {activities?.summary?.byType && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(activities.summary.byType).map(([type, count]) => (
                <div key={type} className={`px-4 py-3 rounded-lg flex items-center gap-3 ${getActivityColor(type)}`}>
                  <span className="text-xl">{getActivityIcon(type)}</span>
                  <div>
                    <span className="font-medium text-lg">{getActivityBadge(type)}</span>
                    <p className="text-sm opacity-80">{count} activities</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities List */}
        {activities?.data && Array.isArray(activities.data) && activities.data.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-400 font-medium border-b border-gray-700">
              <div className="col-span-1">Icon</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-3">User</div>
              <div className="col-span-2 text-right">Time</div>
            </div>
            
            {activities.data.slice(0, 50).map((activity) => (
              <div 
                key={activity.id} 
                className="grid grid-cols-12 gap-3 px-4 py-4 bg-gray-700/20 rounded-lg border border-gray-600/30 hover:border-blue-500/30 transition-all"
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="col-span-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getActivityColor(activity.type)}`}>
                      {getActivityBadge(activity.type)}
                    </span>
                  </div>
                  <p className="font-medium text-white text-lg">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{key}:</span>
                          <span className="text-xs text-gray-300 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <p className="font-medium text-white text-lg">{activity.user || 'System'}</p>
                  {activity.userEmail && (
                    <p className="text-sm text-gray-400 mt-1">{activity.userEmail}</p>
                  )}
                  {activity.userId && (
                    <p className="text-xs text-gray-500 font-mono mt-2">
                      ID: {activity.userId.substring(0, 8)}...
                    </p>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm text-gray-400 font-medium">
                    {formatActivityTime(activity.timestamp)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : activities ? (
          <div className="text-center py-16 text-gray-400">
            <Activity className="w-20 h-20 mx-auto mb-6 opacity-30" />
            <p className="text-xl">No activities recorded for this period</p>
            <p className="text-sm mt-3">Try selecting a different time period</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-6 text-lg">Loading activities...</p>
          </div>
        )}

        {/* View All Link */}
        {activities?.data && activities.data.length > 50 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all">
              View All Activities ({activities.data.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============== PERFORMANCE TAB ===============
function PerformanceTab({
  filmmakersPerformance,
  performancePeriod,
  setPerformancePeriod,
  loading 
}) {
  if (loading && !filmmakersPerformance) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Performance Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <PerformanceIcon className="w-7 h-7 text-blue-400" />
            <h2 className="text-2xl font-bold">Filmmaker Performance - {performancePeriod}</h2>
          </div>
          <select
            value={performancePeriod}
            onChange={(e) => setPerformancePeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Summary Stats */}
        {filmmakersPerformance?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Filmmakers</p>
              <p className="text-3xl font-bold">{filmmakersPerformance.summary.totalFilmmakers}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Active Filmmakers</p>
              <p className="text-3xl font-bold">{filmmakersPerformance.summary.activeFilmmakers}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Period Revenue</p>
              <p className="text-3xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.totalPeriodRevenue).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Period Earnings</p>
              <p className="text-3xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.totalPeriodEarnings).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Top Performer Highlight */}
        {filmmakersPerformance?.summary?.topPerformer && (
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <h3 className="text-xl font-semibold">Top Performer</h3>
            </div>
            <p className="text-2xl font-bold mb-2">{filmmakersPerformance.summary.topPerformer.name}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-500/20 rounded-lg p-3">
                <p className="text-gray-300 text-sm mb-1">Revenue</p>
                <p className="text-xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.topPerformer.periodRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-3">
                <p className="text-gray-300 text-sm mb-1">Performance Score</p>
                <p className="text-xl font-bold">{(parseFloat(filmmakersPerformance.summary.topPerformer.performanceScore) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Filmmakers Performance Charts */}
        {filmmakersPerformance?.performanceData && filmmakersPerformance.performanceData.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <TopFilmmakersChart 
                filmmakers={filmmakersPerformance.performanceData}
              />
              <FilmmakerActivityChart 
                filmmakers={filmmakersPerformance.performanceData}
              />
            </div>

            {/* Filmmakers Summary Table */}
            <div className="mt-8">
              <FilmmakersSummaryTable 
                filmmakers={filmmakersPerformance.performanceData}
              />
            </div>
          </>
        )}

        {/* Detailed Performance Data */}
        {filmmakersPerformance?.performanceData && Array.isArray(filmmakersPerformance.performanceData) && filmmakersPerformance.performanceData.length > 0 ? (
          <div className="space-y-6 mt-8">
            <h3 className="text-2xl font-bold mb-6">Detailed Performance</h3>
            {filmmakersPerformance.performanceData.map((filmmaker) => (
              <div key={filmmaker.id} className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
                {/* Filmmaker Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-2xl mb-2">{filmmaker.name}</h3>
                    <p className="text-gray-400 text-lg">{filmmaker.email}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-3 py-1.5 rounded text-sm font-medium ${
                        filmmaker.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {filmmaker.status}
                      </span>
                      {filmmaker.isVerified && (
                        <span className="px-3 py-1.5 rounded text-sm font-medium bg-blue-500/20 text-blue-400">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-2">Performance Score</p>
                    <p className="text-4xl font-bold">{(parseFloat(filmmaker.overall.performanceScore) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Period Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-2">Period Revenue</p>
                    <p className="text-xl font-semibold">RWF {parseFloat(filmmaker.period.revenue).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-2">Period Views</p>
                    <p className="text-xl font-semibold">{filmmaker.period.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-2">Earnings</p>
                    <p className="text-xl font-semibold">RWF {parseFloat(filmmaker.period.earnings).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-2">Movies Added</p>
                    <p className="text-xl font-semibold">{filmmaker.period.moviesAdded}</p>
                  </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Total Movies</p>
                    <p className="font-semibold text-lg">{filmmaker.overall.totalMovies}</p>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Total Views</p>
                    <p className="font-semibold text-lg">{filmmaker.overall.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Avg Rating</p>
                    <p className="font-semibold text-lg">{parseFloat(filmmaker.overall.avgRating).toFixed(1)} ⭐</p>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
                    <p className="font-semibold text-lg">RWF {parseFloat(filmmaker.overall.totalRevenue).toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Pending Balance</p>
                    <p className="font-semibold text-lg">RWF {parseFloat(filmmaker.overall.pendingBalance).toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-gray-800/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Growth Rate</p>
                    <p className="font-semibold text-green-400 text-lg">{parseFloat(filmmaker.period.growthRate).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Recent Movies */}
                {filmmaker.recentMovies && filmmaker.recentMovies.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-300 mb-4">Recent Movies</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filmmaker.recentMovies.map((movie) => (
                        <div key={movie.id} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-lg">{movie.title}</p>
                            <p className="text-sm text-gray-400 mt-1">{movie.views} views • RWF {movie.revenue}</p>
                          </div>
                          <span className="text-yellow-400 text-xl">{movie.rating > 0 ? `${movie.rating}⭐` : 'No rating'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {filmmaker.indicators && (
                  <div className="flex flex-wrap gap-3 mt-6">
                    {filmmaker.indicators.needsAttention && (
                      <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-sm">⚠️ Needs Attention</span>
                    )}
                    {filmmaker.indicators.isTopPerformer && (
                      <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded text-sm">🏆 Top Performer</span>
                    )}
                    {filmmaker.indicators.hasLowRating && (
                      <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded text-sm">📉 Low Rating</span>
                    )}
                    {filmmaker.indicators.hasHighRevenue && (
                      <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-sm">💰 High Revenue</span>
                    )}
                    {filmmaker.indicators.hasManyViews && (
                      <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded text-sm">👁️ Popular</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filmmakersPerformance ? (
          <div className="text-center py-16 text-gray-400">
            <PerformanceIcon className="w-20 h-20 mx-auto mb-6 opacity-30" />
            <p className="text-xl">No filmmaker performance data available for this period</p>
            <p className="text-sm mt-3">Try selecting a different time period</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-6 text-lg">Loading performance data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============== SHARED COMPONENTS ===============

// Metric Card Component - Shows metric with growth
function MetricCard({ title, value, change, icon }) {
  const isPositive = change >= 0;
  const hasChange = change !== undefined && change !== null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-600/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {hasChange && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className="text-4xl opacity-60">{icon}</div>
      </div>
    </div>
  );
}

// Stats Box Component
function StatsBox({ label, value, subtext }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  );
}

export default AdminDashboardPage;