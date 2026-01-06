import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboard,
  fetchAnalytics,
  filmmakerPerformance,
  recentlyActivities,
  fetchSystemHealth,
  clearError,
  clearSuccessMessage,
} from '../../store/slices/adminSlice';
import { 
  BarChart, Users, Film, AlertCircle, TrendingUp, Mail, Clock, Activity, 
  TrendingUp as PerformanceIcon, Menu, X, Heart, Server, Cpu, Database, 
  Shield, Globe, Cloud, Zap, AlertTriangle, CheckCircle, XCircle, 
  RefreshCw, Download, Wifi, WifiOff, HardDrive, MemoryStick, Thermometer,
  Activity as CpuActivity
} from 'lucide-react';

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
    activities,
    systemHealth,
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.admin);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [performancePeriod, setPerformancePeriod] = useState('month');
  const [activitiesPeriod, setActivitiesPeriod] = useState('week');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [healthRefreshInterval, setHealthRefreshInterval] = useState(30); // seconds
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
    } else if (activeTab === 'health') {
      dispatch(fetchSystemHealth());
    }
  }, [dispatch, activeTab, analyticsPeriod, activitiesPeriod, performancePeriod]);

  // Auto-refresh for system health
  useEffect(() => {
    let interval;
    if (activeTab === 'health' && healthRefreshInterval > 0) {
      interval = setInterval(() => {
        dispatch(fetchSystemHealth());
      }, healthRefreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, activeTab, healthRefreshInterval]);

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'performance', label: 'Performance', icon: PerformanceIcon },
    { id: 'health', label: 'System Health', icon: Heart },
    { id: 'filmmakers', label: 'Filmmakers', icon: Film },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'moderation', label: 'Moderation', icon: AlertCircle },
    { id: 'payments', label: 'Payments', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Manage platform, users, filmmakers, and content</p>
              <p className="text-xs text-gray-400 sm:hidden">Admin Panel</p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className='bg-red-500 px-4 py-2 sm:px-6 sm:py-2 rounded-lg sm:rounded-2xl hover:bg-red-600 transition-colors text-sm sm:text-base w-full sm:w-auto order-last sm:order-none'
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          mobile-menu fixed lg:hidden top-0 left-0 h-full w-64 sm:w-72 bg-gray-900 z-50 transform transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Navigation</h2>
          </div>
          <div className="p-4 space-y-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start sm:items-center gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-red-300 break-words">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start sm:items-center gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-green-300 break-words">{successMessage}</p>
          </div>
        )}

        {/* Navigation Tabs - Desktop */}
        <div className="hidden lg:block mb-8 border-b border-gray-700 overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 md:gap-4 min-w-min">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Tab Indicator */}
        <div className="lg:hidden mb-6 bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {navTabs.find(tab => tab.id === activeTab)?.icon && (
              React.createElement(navTabs.find(tab => tab.id === activeTab).icon, { 
                className: "w-5 h-5 text-blue-400" 
              })
            )}
            <span className="font-semibold text-lg">
              {navTabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
            </span>
            <span className="ml-auto text-sm text-gray-400">Tap menu icon to switch</span>
          </div>
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
          {activeTab === 'health' && (
            <SystemHealthTab
              systemHealth={systemHealth}
              loading={loading}
              refreshInterval={healthRefreshInterval}
              setRefreshInterval={setHealthRefreshInterval}
              onRefresh={() => dispatch(fetchSystemHealth())}
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

// =============== SYSTEM HEALTH TAB ===============
function SystemHealthTab({ 
  systemHealth, 
  loading, 
  refreshInterval, 
  setRefreshInterval,
  onRefresh 
}) {
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500/20 text-gray-400';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'not_configured':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <Activity className="w-5 h-5" />;
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'not_configured':
        return <Activity className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatBytes = (bytesString) => {
    if (!bytesString) return '0 Bytes';
    try {
      const bytes = typeof bytesString === 'string' 
        ? parseFloat(bytesString) 
        : bytesString;
      
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (e) {
      console.error('Error formatting bytes:', e);
      return bytesString;
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const healthData = systemHealth || {};
  const checks = healthData.checks || {};
  const systemInfo = healthData.system || {};
  const memory = systemInfo.memory || {};
  const cpu = systemInfo.cpu || {};
  const disk = systemInfo.disk || {};
  const environment = systemInfo.environment || {};
  const performance = healthData.performance || {};
  
  // Calculate overall status
  const overallStatus = healthData.status || (() => {
    if (memory.status === 'warning') return 'warning';
    return 'healthy';
  })();

  // Get database info
  const databaseInfo = checks.database || {};
  
  // Get external services info
  const externalServices = checks.externalServices || {};

  return (
    <div className="space-y-6 md:space-y-8">
      {/* System Health Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" />
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">System Health Monitor</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Last updated: {new Date(healthData.timestamp || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Refresh Interval Control */}
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value="0">Manual</option>
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </select>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-4 rounded-lg mb-6 ${getStatusColor(overallStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <h3 className="text-lg font-semibold">System Status: {overallStatus.toUpperCase()}</h3>
                <p className="text-sm opacity-80">
                  {overallStatus === 'healthy' 
                    ? 'All systems operating normally' 
                    : overallStatus === 'warning'
                    ? 'Some services experiencing issues'
                    : 'Checking system status...'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold">
                {healthData.success ? '✓' : '✗'}
              </p>
              <p className="text-xs opacity-70">API Status</p>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="System Uptime"
            value={formatUptime(systemInfo.uptime?.systemSeconds)}
            icon={<Server className="w-5 h-5" />}
            status="healthy"
            subtext={`Process: ${formatUptime(systemInfo.uptime?.processSeconds)}`}
          />
          <MetricCard
            title="CPU Usage"
            value={`${cpu.loadAverage?.['15min'] || 0}%`}
            icon={<Cpu className="w-5 h-5" />}
            status={cpu.status || 'healthy'}
            subtext={`${cpu.cores || 0} cores | ${cpu.model || 'Unknown'}`}
          />
          <MetricCard
            title="Memory"
            value={`${Math.round(parseFloat(memory.system?.used) || 0)}%`}
            icon={<MemoryStick className="w-5 h-5" />}
            status={memory.status || 'healthy'}
            subtext={`Free: ${formatBytes(memory.system?.free)}`}
          />
          <MetricCard
            title="Response Time"
            value={`${performance.responseTime || 0}ms`}
            icon={<Zap className="w-5 h-5" />}
            status={performance.responseTime < 100 ? 'healthy' : 'warning'}
            subtext="API latency"
          />
        </div>

        {/* Environment Info */}
        <div className="bg-gray-700/20 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Environment Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-400">Node Version</p>
              <p className="text-sm font-medium">{environment.nodeVersion}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Platform</p>
              <p className="text-sm font-medium">{environment.platform}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Architecture</p>
              <p className="text-sm font-medium">{environment.arch}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Environment</p>
              <p className="text-sm font-medium">{environment.env}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Status */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Database Status
            </h3>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(databaseInfo.status)}`}>
              {databaseInfo.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Response Time</p>
                <p className="text-2xl font-bold">{databaseInfo.responseTime || '0ms'}</p>
              </div>
              <div className="bg-gray-700/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Dialect</p>
                <p className="text-2xl font-bold">{databaseInfo.dialect || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/10 rounded-lg">
                <span className="text-sm">Connection Status</span>
                <span className={`px-2 py-1 rounded text-xs ${databaseInfo.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {databaseInfo.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-700/10 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">Max Pool</p>
                  <p className="text-sm font-semibold">{databaseInfo.pool?.max || 0}</p>
                </div>
                <div className="bg-gray-700/10 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">Idle Timeout</p>
                  <p className="text-sm font-semibold">{databaseInfo.pool?.idle ? `${databaseInfo.pool.idle}ms` : 'N/A'}</p>
                </div>
                <div className="bg-gray-700/10 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">Acquire Timeout</p>
                  <p className="text-sm font-semibold">{databaseInfo.pool?.acquire ? `${databaseInfo.pool.acquire}ms` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* External Services Status */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              External Services
            </h3>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(externalServices.status)}`}>
              {externalServices.status?.toUpperCase() || 'NOT_CONFIGURED'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-700/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Cloud className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Service Status</p>
                  <p className="text-2xl font-bold">{externalServices.status || 'Not Configured'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {externalServices.message || 'Add external service checks as needed'}
              </p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">Configuration Required</p>
                  <p className="text-xs text-yellow-400/80 mt-1">
                    External service monitoring is not configured. Consider adding checks for:
                  </p>
                  <ul className="text-xs text-yellow-400/60 mt-2 space-y-1">
                    <li className="flex items-center gap-1">• Payment gateways (Stripe, PayPal)</li>
                    <li className="flex items-center gap-1">• Email services (SendGrid, Mailgun)</li>
                    <li className="flex items-center gap-1">• Storage services (AWS S3, Cloudinary)</li>
                    <li className="flex items-center gap-1">• CDN services</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Details */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <MemoryStick className="w-5 h-5 text-blue-400" />
            Memory Details
          </h3>
          
          <div className="space-y-4">
            {/* System Memory */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">System Memory Usage</span>
                <span className="font-medium">{memory.system?.used || '0'} of {memory.system?.total || '0'}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${memory.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ 
                    width: `${Math.min(parseFloat(memory.system?.usedPercent?.replace('%', '') || 0), 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Used: {formatBytes(memory.system?.used)}</span>
                <span>Free: {formatBytes(memory.system?.free)}</span>
                <span>Total: {formatBytes(memory.system?.total)}</span>
              </div>
            </div>

            {/* Process Memory */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
              <div className="bg-gray-700/20 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Heap Used</p>
                <p className="text-lg font-bold">{formatBytes(memory.process?.heapUsed)}</p>
              </div>
              <div className="bg-gray-700/20 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">RSS</p>
                <p className="text-lg font-bold">{formatBytes(memory.process?.rss)}</p>
              </div>
              <div className="bg-gray-700/20 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Heap Total</p>
                <p className="text-lg font-bold">{formatBytes(memory.process?.heapTotal)}</p>
              </div>
              <div className="bg-gray-700/20 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">External</p>
                <p className="text-lg font-bold">{formatBytes(memory.process?.external)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CPU & Disk Details */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            CPU & Disk Details
          </h3>
          
          <div className="space-y-6">
            {/* CPU Load Averages */}
            <div>
              <p className="text-sm font-medium mb-3">CPU Load Average</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-700/20 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">1 min</p>
                  <p className="text-xl font-bold">{cpu.loadAverage?.['1min'] || '0.00'}</p>
                </div>
                <div className="bg-gray-700/20 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">5 min</p>
                  <p className="text-xl font-bold">{cpu.loadAverage?.['5min'] || '0.00'}</p>
                </div>
                <div className="bg-gray-700/20 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">15 min</p>
                  <p className="text-xl font-bold">{cpu.loadAverage?.['15min'] || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Disk Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Disk Status</p>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(disk.status)}`}>
                  {disk.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="bg-gray-700/20 p-3 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Home Directory</p>
                    <p className="text-xs text-gray-400 truncate">{disk.homeDir || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Info */}
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Process ID</p>
                  <p className="text-sm font-medium font-mono">{environment.pid || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Process Uptime</p>
                  <p className="text-sm font-medium">{systemInfo.uptime?.process || '0s'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {memory.status === 'warning' && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Recommendations
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-full mt-1">
                <MemoryStick className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium">High Memory Usage Detected</p>
                <p className="text-sm text-gray-300">
                  System memory usage is at {memory.system?.usedPercent || '0%'}. Consider:
                </p>
                <ul className="text-sm text-gray-300 mt-2 space-y-1 ml-4">
                  <li>• Optimizing application memory usage</li>
                  <li>• Scaling up server resources</li>
                  <li>• Reviewing memory leaks in application code</li>
                  <li>• Implementing caching strategies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== HEALTH METRIC CARD ===============
function MetricCard({ title, value, icon, status, subtext }) {
  return (
    <div className="bg-gray-700/20 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-600/30 rounded-lg">
          {icon}
        </div>
        <span className={`px-2 py-1 rounded text-xs ${status === 'healthy' ? 'bg-green-500/20 text-green-400' : status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">{value}</p>
      <p className="text-sm text-gray-400 truncate">{title}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1 truncate">{subtext}</p>}
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

  const stats = dashboard?.stats || dashboard || {};
  const analyticsData = analytics?.stats || analytics || {};

  const totalUsers = stats?.users?.total ?? 0;
  const totalFilmmakers = stats?.users?.filmmakers ?? 0;
  const totalMovies = stats?.content?.totalMovies ?? 0;
  const userGrowth = stats.userGrowth || 0;
  const filmmakersGrowth = stats.filmmakersGrowth || 0;
  const moviesGrowth = stats.moviesGrowth || 0;

  const periodData = analytics?.period ? analytics : analyticsData;
  const metrics = periodData?.metrics || analyticsData?.metrics || {};

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Period Analytics - {analyticsPeriod}</h2>
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none text-sm sm:text-base w-full sm:w-auto"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto">
                <MetricsBarChart
                  period={analyticsPeriod}
                  metrics={analytics?.metrics || metrics}
                />
              </div>
              <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto">
                <RevenueChart
                  revenue={analytics?.metrics?.revenue || metrics?.revenue || 0}
                  platformEarnings={analytics?.metrics?.platformEarnings || metrics?.platformEarnings || 0}
                  period={analyticsPeriod}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Platform Statistics Summary */}
      {stats.totalActiveUsers !== undefined && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

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

  const getActivityBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'signup':
        return 'New User';
      case 'movie_upload':
        return 'Upload';
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
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
        {/* Activities Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Recent Activities</h2>
          </div>
          <select
            value={activitiesPeriod}
            onChange={(e) => setActivitiesPeriod(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Activities Stats */}
        {activities?.summary && (
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Activities</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{activities.summary.totalActivities || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Active Users</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{activities.summary.activeUsers || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Movie Views</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{activities.summary.movieViews || 0}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">New Uploads</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{activities.summary.newUploads || 0}</p>
            </div>
          </div>
        )}

        {/* Activity Type Breakdown */}
        {activities?.summary?.byType && (
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Activity Breakdown</h3>
            <div className="flex flex-nowrap gap-2 sm:gap-3 pb-2">
              {Object.entries(activities.summary.byType).map(([type, count]) => (
                <div key={type} className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 flex-shrink-0 ${getActivityColor(type)}`}>
                  <span className="text-lg sm:text-xl">{getActivityIcon(type)}</span>
                  <div>
                    <span className="font-medium text-sm sm:text-base">{getActivityBadge(type)}</span>
                    <p className="text-xs opacity-80">{count} activities</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities List */}
        {activities?.data && Array.isArray(activities.data) && activities.data.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-400 font-medium border-b border-gray-700">
              <div className="col-span-1">Icon</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-3">User</div>
              <div className="col-span-2 text-right">Time</div>
            </div>
            
            {activities.data.slice(0, 20).map((activity) => (
              <div 
                key={activity.id} 
                className="sm:grid sm:grid-cols-12 gap-3 p-3 sm:p-4 bg-gray-700/20 rounded-lg border border-gray-600/30 hover:border-blue-500/30 transition-all"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(activity.type)}`}>
                          {getActivityBadge(activity.type)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{activity.user || 'System'}</p>
                      {activity.userEmail && (
                        <p className="text-xs text-gray-400">{activity.userEmail}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-white text-sm">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-400">
                          <span className="font-medium">{key}:</span> {String(value).substring(0, 20)}
                          {String(value).length > 20 ? '...' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:col-span-1 items-center">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="hidden sm:block sm:col-span-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {getActivityBadge(activity.type)}
                    </span>
                  </div>
                  <p className="font-medium text-white text-sm">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{key}:</span>
                          <span className="text-xs text-gray-300 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block sm:col-span-3">
                  <p className="font-medium text-white text-sm">{activity.user || 'System'}</p>
                  {activity.userEmail && (
                    <p className="text-xs text-gray-400 mt-1">{activity.userEmail}</p>
                  )}
                  {activity.userId && (
                    <p className="text-xs text-gray-500 font-mono mt-2">
                      ID: {activity.userId.substring(0, 8)}...
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">
                      {formatActivityTime(activity.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities ? (
          <div className="text-center py-8 sm:py-16 text-gray-400">
            <Activity className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6 opacity-30" />
            <p className="text-base sm:text-xl">No activities recorded</p>
            <p className="text-sm mt-2">Try selecting a different time period</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4 sm:mt-6 text-sm sm:text-lg">Loading activities...</p>
          </div>
        )}

        {/* View All Link */}
        {activities?.data && activities.data.length > 20 && (
          <div className="mt-6 text-center">
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-sm sm:text-base">
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
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
        {/* Performance Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <PerformanceIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Filmmaker Performance</h2>
          </div>
          <select
            value={performancePeriod}
            onChange={(e) => setPerformancePeriod(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Summary Stats */}
        {filmmakersPerformance?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Total Filmmakers</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{filmmakersPerformance.summary.totalFilmmakers}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Active Filmmakers</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{filmmakersPerformance.summary.activeFilmmakers}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Period Revenue</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.totalPeriodRevenue).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Period Earnings</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.totalPeriodEarnings).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Top Performer Highlight */}
        {filmmakersPerformance?.summary?.topPerformer && (
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl md:text-3xl">🏆</span>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Top Performer</h3>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{filmmakersPerformance.summary.topPerformer.name}</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="bg-blue-500/20 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-gray-300 mb-1">Revenue</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">RWF {parseFloat(filmmakersPerformance.summary.topPerformer.periodRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-gray-300 mb-1">Performance Score</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">{(parseFloat(filmmakersPerformance.summary.topPerformer.performanceScore) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Filmmakers Performance Charts */}
        {filmmakersPerformance?.performanceData && filmmakersPerformance.performanceData.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
              <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto">
                <TopFilmmakersChart 
                  filmmakers={filmmakersPerformance.performanceData}
                />
              </div>
              <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto">
                <FilmmakerActivityChart 
                  filmmakers={filmmakersPerformance.performanceData}
                />
              </div>
            </div>

            {/* Filmmakers Summary Table */}
            <div className="mt-6 sm:mt-8 overflow-x-auto">
              <FilmmakersSummaryTable 
                filmmakers={filmmakersPerformance.performanceData}
              />
            </div>
          </>
        )}

        {/* Detailed Performance Data */}
        {filmmakersPerformance?.performanceData && Array.isArray(filmmakersPerformance.performanceData) && filmmakersPerformance.performanceData.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Detailed Performance</h3>
            {filmmakersPerformance.performanceData.slice(0, 3).map((filmmaker) => (
              <div key={filmmaker.id} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 sm:p-6">
                {/* Filmmaker Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg md:text-xl lg:text-2xl mb-1 sm:mb-2">{filmmaker.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">{filmmaker.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                      <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium ${
                        filmmaker.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {filmmaker.status}
                      </span>
                      {filmmaker.isVerified && (
                        <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Performance Score</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{(parseFloat(filmmaker.overall.performanceScore) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Period Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 md:p-4">
                    <p className="text-xs text-gray-400 mb-1">Period Revenue</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold">RWF {parseFloat(filmmaker.period.revenue).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 md:p-4">
                    <p className="text-xs text-gray-400 mb-1">Period Views</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold">{filmmaker.period.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 md:p-4">
                    <p className="text-xs text-gray-400 mb-1">Earnings</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold">RWF {parseFloat(filmmaker.period.earnings).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 md:p-4">
                    <p className="text-xs text-gray-400 mb-1">Movies Added</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold">{filmmaker.period.moviesAdded}</p>
                  </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2 md:gap-3 mb-4 sm:mb-6">
                  {[
                    { label: 'Total Movies', value: filmmaker.overall.totalMovies },
                    { label: 'Total Views', value: filmmaker.overall.totalViews.toLocaleString() },
                    { label: 'Avg Rating', value: `${parseFloat(filmmaker.overall.avgRating).toFixed(1)} ⭐` },
                    { label: 'Total Revenue', value: `RWF ${parseFloat(filmmaker.overall.totalRevenue).toLocaleString()}` },
                    { label: 'Pending Balance', value: `RWF ${parseFloat(filmmaker.overall.pendingBalance).toLocaleString()}` },
                    { label: 'Growth Rate', value: `${parseFloat(filmmaker.period.growthRate).toFixed(1)}%`, className: 'text-green-400' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center bg-gray-800/30 rounded-lg p-1 sm:p-2 md:p-3">
                      <p className="text-xs text-gray-400 mb-1 truncate">{stat.label}</p>
                      <p className={`text-xs sm:text-sm font-semibold truncate ${stat.className || ''}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Movies */}
                {filmmaker.recentMovies && filmmaker.recentMovies.length > 0 && (
                  <div className="mt-4 sm:mt-6">
                    <p className="text-sm sm:text-base font-semibold text-gray-300 mb-3">Recent Movies</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {filmmaker.recentMovies.slice(0, 2).map((movie) => (
                        <div key={movie.id} className="bg-gray-800/50 rounded-lg p-2 sm:p-3 md:p-4 flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">{movie.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{movie.views} views • RWF {movie.revenue}</p>
                          </div>
                          <span className="text-yellow-400 text-sm sm:text-base md:text-xl ml-2 flex-shrink-0">
                            {movie.rating > 0 ? `${movie.rating}⭐` : 'No rating'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {filmmaker.indicators && (
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                    {filmmaker.indicators.needsAttention && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">⚠️ Needs Attention</span>
                    )}
                    {filmmaker.indicators.isTopPerformer && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">🏆 Top Performer</span>
                    )}
                    {filmmaker.indicators.hasLowRating && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">📉 Low Rating</span>
                    )}
                    {filmmaker.indicators.hasHighRevenue && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">💰 High Revenue</span>
                    )}
                    {filmmaker.indicators.hasManyViews && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">👁️ Popular</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Show More Button for Mobile */}
            {filmmakersPerformance.performanceData.length > 3 && (
              <div className="text-center pt-4">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-sm sm:text-base">
              Load More Filmmakers ({filmmakersPerformance.performanceData.length - 3} more)
            </button>
          </div>
        )}
      </div>
    ) : filmmakersPerformance ? (
      <div className="text-center py-8 sm:py-16 text-gray-400">
        <PerformanceIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6 opacity-30" />
        <p className="text-base sm:text-xl">No performance data available</p>
        <p className="text-sm mt-2">Try selecting a different time period</p>
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 mt-4 sm:mt-6 text-sm sm:text-lg">Loading performance data...</p>
      </div>
    )}
      </div>
    </div>
  );
}

// =============== SHARED COMPONENTS ===============
function StatsBox({ label, value, subtext }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 md:p-6">
      <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">{label}</p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-500 truncate">{subtext}</p>
    </div>
  );
}

export default AdminDashboardPage;