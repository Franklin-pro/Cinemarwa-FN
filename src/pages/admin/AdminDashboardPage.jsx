import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboard,
  fetchAnalytics,
  clearError,
  clearSuccessMessage,
} from '../../store/slices/adminSlice';
import { BarChart, Users, Film, AlertCircle, TrendingUp } from 'lucide-react';

// Admin Dashboard Tabs
import FilmmakerManagement from '../../components/admin/FilmmakerManagement';
import UserManagement from '../../components/admin/UserManagement';
import ContentModeration from '../../components/admin/ContentModeration';
import PaymentReconciliation from '../../components/admin/PaymentReconciliation';

// Analytics Charts Components
import {
  MetricsBarChart,
  RevenueChart,
  TopFilmmakersChart,
  FilmmakerActivityChart,
  AnalyticsSummary,
  FilmmakersSummaryTable,
} from '../../components/admin/AnalyticsCharts';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';



function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { dashboard, analytics, loading, error, successMessage } = useSelector(
    (state) => state.admin
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAnalytics(analyticsPeriod));
  }, [dispatch, analyticsPeriod]);
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
            <button onClick={handleLogout} className='bg-red-500 px-6 py-2 rounded-2xl hover:bg-red-600'>Sign-Out</button>
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

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-700 flex gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'filmmakers', label: 'Filmmakers', icon: Film },
            { id: 'users', label: 'Users', icon: Users },
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
          {activeTab === 'filmmakers' && <FilmmakerManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'moderation' && <ContentModeration />}
          {activeTab === 'payments' && <PaymentReconciliation />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component - Displays dynamic data from backend
function OverviewTab({ dashboard, analytics, analyticsPeriod, setAnalyticsPeriod, loading }) {
  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const stats = dashboard?.stats || dashboard || {};
  const analyticsData = analytics?.stats || analytics || analytics || {};


  const totalUsers = stats?.users?.total ?? 0;
  const totalFilmmakers = stats?.users?.filmmakers ?? 0;
  const totalMovies = stats?.content?.totalMovies ?? 0;
  const monthlyRevenue = stats?.finance?.totalRevenue ?? 0;
  const userGrowth = stats.userGrowth || 0;
  const filmmakersGrowth = stats.filmmakersGrowth || 0;
  const moviesGrowth = stats.moviesGrowth || 0;
  const revenueGrowth = stats.revenueGrowth || 0;

  // Extract period data
  const periodData = analytics?.period ? analytics : analyticsData;
  const metrics = periodData?.metrics || analyticsData?.metrics || {};
  const topFilmmmakers = periodData?.top?.filmmakers || analyticsData?.top?.filmmakers || [];

  return (
    <div className="space-y-8">
      {/* Key Metrics - All Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <MetricCard
          title="Total Revenue"
          value={`$${typeof monthlyRevenue === 'number' ? monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}`}
          change={revenueGrowth}
          icon="💰"
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

            {/* Filmmakers Performance Charts */}
            {topFilmmmakers && topFilmmmakers.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <TopFilmmakersChart filmmakers={topFilmmmakers} />
                <FilmmakerActivityChart filmmakers={topFilmmmakers} />
              </div>
            )}

            {/* Filmmakers Summary Table */}
            {topFilmmmakers && topFilmmmakers.length > 0 && (
              <div className="mt-8">
                <FilmmakersSummaryTable filmmakers={topFilmmmakers} />
              </div>
            )}
          </>
        ) }
      </div>

      {/* Recent Activity - Dynamic Data */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {dashboard?.recentActivity && Array.isArray(dashboard.recentActivity) && dashboard.recentActivity.length > 0 ? (
            dashboard.recentActivity.slice(0, 10).map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                <div className="flex-1">
                  <p className="font-medium">{activity.description || activity.action || 'Activity'}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activity.userName || activity.user || 'System'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No recent activity available</p>
            </div>
          )}
        </div>
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

// Analytics Card Component - Shows individual metric
function AnalyticsCard({ label, value }) {
  return (
    <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 text-center hover:border-blue-500/50 transition-all">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
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
