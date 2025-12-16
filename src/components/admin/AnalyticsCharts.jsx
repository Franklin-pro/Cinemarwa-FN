import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Helper function to format currency
const formatCurrency = (value) => {
  return `RWF ${parseFloat(value || 0).toFixed(2)}`;
};

// Helper function to parse numeric values safely
const safeParseNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Metrics Overview Bar Chart - Shows New Users, New Movies, Transactions
export function MetricsBarChart({ period, metrics, isLoading = false }) {
  // Prepare data for chart
  const chartData = [
    {
      name: period || 'Current Period',
      'New Users': safeParseNumber(metrics?.newUsers || 0),
      'New Movies': safeParseNumber(metrics?.newMovies || 0),
      'Transactions': safeParseNumber(metrics?.transactions || 0),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Metrics Overview - {period}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Metrics Overview - {period}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend />
          <Bar dataKey="New Users" fill="#3B82F6" />
          <Bar dataKey="New Movies" fill="#10B981" />
          <Bar dataKey="Transactions" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{safeParseNumber(metrics?.newUsers || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">New Users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{safeParseNumber(metrics?.newMovies || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">New Movies</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">{safeParseNumber(metrics?.transactions || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">Transactions</p>
        </div>
      </div>
    </div>
  );
}

// Revenue Analytics Chart
export function RevenueChart({ revenue = 0, platformEarnings = 0, period, isLoading = false }) {
  const revenueValue = safeParseNumber(revenue);
  const platformEarningsValue = safeParseNumber(platformEarnings);
  const filmmakerEarnings = revenueValue - platformEarningsValue;

  const data = [
    {
      name: 'Platform Earnings',
      value: platformEarningsValue,
      color: '#3B82F6',
    },
    {
      name: 'Filmmaker Earnings',
      value: filmmakerEarnings,
      color: '#10B981',
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Revenue Distribution - {period}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Revenue Distribution - {period}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => [formatCurrency(value), 'Amount']}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Revenue breakdown */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-white">{formatCurrency(revenueValue)}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-sm text-gray-400">Filmmaker Share</p>
          <p className="text-xl font-bold text-white">{formatCurrency(filmmakerEarnings)}</p>
          <p className="text-xs text-gray-400">
            {revenueValue > 0 ? ((filmmakerEarnings / revenueValue) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
      </div>
    </div>
  );
}

// Top Filmmakers Chart - Shows earnings distribution
export function TopFilmmakersChart({ filmmakers = [], isLoading = false }) {
  // Process and limit to top 10 filmmakers
  const processedData = filmmakers
    .slice(0, 10)
    .map((filmmaker) => ({
      name: filmmaker.name || `User ${filmmaker.id?.substring(0, 5) || 'Unknown'}`,
      // Use the correct property names from your performance data
      earnings: safeParseNumber(filmmaker.period?.earnings || filmmaker.overall?.totalEarned || 0),
      revenue: safeParseNumber(filmmaker.period?.revenue || filmmaker.overall?.totalRevenue || 0),
      movies: safeParseNumber(filmmaker.overall?.totalMovies || filmmaker.period?.moviesAdded || 0),
      performanceScore: safeParseNumber(filmmaker.overall?.performanceScore || 0),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Performance</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Performance</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No filmmaker data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Performance</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => {
              if (name === 'Revenue' || name === 'Earnings') {
                return [formatCurrency(value), name];
              }
              return [value.toLocaleString(), name];
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="earnings" fill="#10B981" name="Earnings" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Filmmaker Activity Chart - Views, Downloads, Revenue
export function FilmmakerActivityChart({ filmmakers = [], isLoading = false }) {
  // Process and limit to top 8 filmmakers for better readability
  const processedData = filmmakers
    .slice(0, 8)
    .map((filmmaker) => ({
      name: filmmaker.name?.substring(0, 12) || `User ${filmmaker.id?.substring(0, 5) || 'Unknown'}`,
      views: safeParseNumber(filmmaker.period?.views || filmmaker.overall?.totalViews || 0),
      // Use efficiency metrics or calculate downloads from views
      downloads: safeParseNumber(filmmaker.overall?.totalDownloads || Math.floor(safeParseNumber(filmmaker.period?.views || 0) * 0.3)),
      // Use recent movies count or efficiency metrics
      moviesAdded: safeParseNumber(filmmaker.period?.moviesAdded || filmmaker.overall?.totalMovies || 0),
      growthRate: safeParseNumber(filmmaker.period?.growthRate || 0),
    }))
    .sort((a, b) => b.views - a.views);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Activity Metrics</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Activity Metrics</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No activity data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Activity Metrics</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend />
          <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[4, 4, 0, 0]} />
          <Bar dataKey="downloads" fill="#10B981" name="Downloads" radius={[4, 4, 0, 0]} />
          <Bar dataKey="moviesAdded" fill="#F59E0B" name="Movies Added" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Revenue Trend Chart - Shows revenue over time
export function RevenueTrendChart({ data = [], period = 'Monthly', isLoading = false }) {
  // Process data for line chart
  const chartData = data.map((item) => ({
    date: item.date || item.month || item.period || 'Unknown',
    revenue: safeParseNumber(item.revenue || 0),
    earnings: safeParseNumber(item.earnings || 0),
    views: safeParseNumber(item.views || 0),
  }));

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Revenue Trend - {period}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    // Show sample data if no data provided
    const sampleData = [
      { date: 'Jan', revenue: 4000, earnings: 2800, views: 2400 },
      { date: 'Feb', revenue: 3000, earnings: 2100, views: 1800 },
      { date: 'Mar', revenue: 2000, earnings: 1400, views: 1200 },
      { date: 'Apr', revenue: 2780, earnings: 1946, views: 1600 },
      { date: 'May', revenue: 1890, earnings: 1323, views: 1100 },
      { date: 'Jun', revenue: 2390, earnings: 1673, views: 1400 },
    ];

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Revenue Trend - {period}</h3>
        <p className="text-sm text-gray-400 mb-4">Showing sample data</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value) => [value.toLocaleString(), 'Value']}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="earnings" stroke="#10B981" name="Earnings" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Revenue Trend - {period}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => [value.toLocaleString(), 'Value']}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="earnings" stroke="#10B981" name="Earnings" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="views" stroke="#F59E0B" name="Views" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simple Summary Stats with styled cards
export function AnalyticsSummary({ data, period, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-6 text-white">Analytics Summary - {period}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-6 text-white">Analytics Summary - {period}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Users */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">New Users</p>
          <p className="text-3xl font-bold text-blue-400">{safeParseNumber(metrics.newUsers || 0).toLocaleString()}</p>
        </div>

        {/* New Movies */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">New Movies</p>
          <p className="text-3xl font-bold text-green-400">{safeParseNumber(metrics.newMovies || 0).toLocaleString()}</p>
        </div>

        {/* Transactions */}
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Transactions</p>
          <p className="text-3xl font-bold text-amber-400">{safeParseNumber(metrics.transactions || 0).toLocaleString()}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Revenue</p>
          <p className="text-3xl font-bold text-purple-400">
            {formatCurrency(safeParseNumber(metrics.revenue || 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

// Top Filmmakers Summary Table
export function FilmmakersSummaryTable({ filmmakers = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Summary</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-1/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-600 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!filmmakers || filmmakers.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Summary</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No filmmaker data available</p>
        </div>
      </div>
    );
  }

  // Process and limit to top 10 filmmakers
  const topFilmmakers = filmmakers
    .slice(0, 10)
    .map((filmmaker) => ({
      id: filmmaker.id,
      name: filmmaker.name || 'Unknown Filmmaker',
      totalMovies: safeParseNumber(filmmaker.overall?.totalMovies || 0),
      totalViews: safeParseNumber(filmmaker.overall?.totalViews || 0),
      // Use period views for recent activity
      periodViews: safeParseNumber(filmmaker.period?.views || 0),
      avgRating: safeParseNumber(filmmaker.overall?.avgRating || filmmaker.period?.avgMovieRating || 0),
      totalEarned: safeParseNumber(filmmaker.overall?.totalEarned || 0),
      periodEarnings: safeParseNumber(filmmaker.period?.earnings || 0),
      performanceScore: safeParseNumber(filmmaker.overall?.performanceScore || 0),
    }))
    .sort((a, b) => b.periodEarnings - a.periodEarnings);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">Name</th>
              <th className="text-right py-3 px-4 text-gray-400">Movies</th>
              <th className="text-right py-3 px-4 text-gray-400">Total Views</th>
              <th className="text-right py-3 px-4 text-gray-400">Period Views</th>
              <th className="text-right py-3 px-4 text-gray-400">Avg Rating</th>
              <th className="text-right py-3 px-4 text-gray-400">Period Earnings</th>
              <th className="text-right py-3 px-4 text-gray-400">Performance</th>
            </tr>
          </thead>
          <tbody>
            {topFilmmakers.map((filmmaker, idx) => (
              <tr
                key={filmmaker.id || idx}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <span className="text-blue-400 font-bold">
                        {filmmaker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate max-w-[120px]">{filmmaker.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {filmmaker.totalMovies.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {filmmaker.totalViews.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {filmmaker.periodViews.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {filmmaker.avgRating.toFixed(1)} ⭐
                </td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">
                  {formatCurrency(filmmaker.periodEarnings)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    filmmaker.performanceScore >= 0.8 
                      ? 'bg-green-500/20 text-green-400'
                      : filmmaker.performanceScore >= 0.6
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(filmmaker.performanceScore * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Filmmakers</p>
          <p className="text-2xl font-bold text-white">{topFilmmakers.length}</p>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Period Earnings</p>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(topFilmmakers.reduce((sum, f) => sum + f.periodEarnings, 0))}
          </p>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <p className="text-sm text-gray-400">Avg Performance</p>
          <p className="text-2xl font-bold text-blue-400">
            {((topFilmmakers.reduce((sum, f) => sum + f.performanceScore, 0) / topFilmmakers.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// Chart Container - Wrapper for all charts
export function ChartsContainer({ children, title }) {
  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

// New Timeline Chart for Filmmaker Performance
export function FilmmakerTimelineChart({ timelineData = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Timeline</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Timeline</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => {
              if (name === 'Revenue' || name === 'Earnings') {
                return [formatCurrency(value), name];
              }
              return [value.toLocaleString(), name];
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Revenue" />
          <Area type="monotone" dataKey="views" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Views" />
          <Area type="monotone" dataKey="earnings" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Earnings" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Performance Distribution Chart
export function PerformanceDistributionChart({ chartData, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Performance Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const distributionData = chartData?.performanceDistribution 
    ? [
        { name: 'Excellent', value: chartData.performanceDistribution.excellent, color: '#10B981' },
        { name: 'Good', value: chartData.performanceDistribution.good, color: '#3B82F6' },
        { name: 'Average', value: chartData.performanceDistribution.average, color: '#F59E0B' },
        { name: 'Poor', value: chartData.performanceDistribution.poor, color: '#EF4444' },
        { name: 'Very Poor', value: chartData.performanceDistribution.veryPoor, color: '#7F1D1D' },
      ]
    : [];

  if (distributionData.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Performance Distribution</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No distribution data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Performance Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => [value, `${name} Filmmakers`]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export all components
export default {
  MetricsBarChart,
  RevenueChart,
  TopFilmmakersChart,
  FilmmakerActivityChart,
  RevenueTrendChart,
  AnalyticsSummary,
  FilmmakersSummaryTable,
  ChartsContainer,
  FilmmakerTimelineChart,
  PerformanceDistributionChart,
};