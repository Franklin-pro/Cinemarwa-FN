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

// Metrics Overview Bar Chart - Shows New Users, New Movies, Transactions
export function MetricsBarChart({ period, metrics }) {
  const data = [
    {
      name: 'Period Metrics',
      'New Users': metrics?.newUsers || 0,
      'New Movies': metrics?.newMovies || 0,
      'Transactions': metrics?.transactions || 0,
    },
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Metrics Overview - {period}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          />
          <Legend />
          <Bar dataKey="New Users" fill="#3B82F6" />
          <Bar dataKey="New Movies" fill="#10B981" />
          <Bar dataKey="Transactions" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Revenue Analytics Chart
export function RevenueChart({ revenue, platformEarnings, period }) {
  const data = [
    {
      name: 'Revenue',
      value: parseFloat(revenue) || 0,
    },
    {
      name: 'Platform Earnings',
      value: parseFloat(platformEarnings) || 0,
    },
  ];

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
            label={({ name, value }) => `${name}:  RWF ${value.toFixed(2)}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => `RWF ${value.toFixed(2)}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Top Filmmakers Chart - Shows earnings distribution
export function TopFilmmakersChart({ filmmakers }) {
  const data = (filmmakers || []).map((filmmaker) => ({
    name: filmmaker.name,
    earnings: filmmaker.filmmmakerFinance?.totalEarned || 0,
    revenue: filmmaker.filmmmakerStats?.totalRevenue || 0,
    views: filmmaker.filmmmakerStats?.totalViews || 0,
  }));

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Performance</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value) => `RWF ${value.toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="earnings" fill="#10B981" name="Earnings" />
            <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No filmmaker data available</p>
        </div>
      )}
    </div>
  );
}

// Filmmaker Activity Chart - Views, Downloads, Revenue
export function FilmmakerActivityChart({ filmmakers }) {
  const data = (filmmakers || []).map((filmmaker) => ({
    name: filmmaker.name,
    views: filmmaker.filmmmakerStats?.totalViews || 0,
    downloads: filmmaker.filmmmakerStats?.totalDownloads || 0,
    reviews: filmmaker.filmmmakerStats?.totalReviews || 0,
  }));

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Filmmaker Activity Metrics</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="views" fill="#3B82F6" name="Views" />
            <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
            <Bar dataKey="reviews" fill="#F59E0B" name="Reviews" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No activity data available</p>
        </div>
      )}
    </div>
  );
}

// Simple Summary Stats with styled cards
export function AnalyticsSummary({ data, period }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-6 text-white">Analytics Summary - {period}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Users */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">New Users</p>
          <p className="text-3xl font-bold text-blue-400">{data?.metrics?.newUsers || 0}</p>
        </div>

        {/* New Movies */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">New Movies</p>
          <p className="text-3xl font-bold text-green-400">{data?.metrics?.newMovies || 0}</p>
        </div>

        {/* Transactions */}
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Transactions</p>
          <p className="text-3xl font-bold text-amber-400">{data?.metrics?.transactions || 0}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Revenue</p>
          <p className="text-3xl font-bold text-purple-400">
            RWF {parseFloat(data?.metrics?.revenue || 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Top Filmmakers Summary Table
export function FilmmakersSummaryTable({ filmmakers }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-white">Top Filmmakers Summary</h3>
      {filmmakers && filmmakers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Name</th>
                <th className="text-right py-3 px-4 text-gray-400">Total Movies</th>
                <th className="text-right py-3 px-4 text-gray-400">Total Views</th>
                <th className="text-right py-3 px-4 text-gray-400">Total Downloads</th>
                <th className="text-right py-3 px-4 text-gray-400">Avg Rating</th>
                <th className="text-right py-3 px-4 text-gray-400">Total Earned</th>
              </tr>
            </thead>
            <tbody>
              {filmmakers.map((filmmaker, idx) => (
                <tr
                  key={filmmaker._id || idx}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3 px-4 text-white font-medium">{filmmaker.name}</td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {filmmaker.filmmmakerStats?.totalMovies || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {(filmmaker.filmmmakerStats?.totalViews || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {(filmmaker.filmmmakerStats?.totalDownloads || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {(filmmaker.filmmmakerStats?.averageRating || 0).toFixed(2)} ⭐
                  </td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">
                    RWF {(filmmaker.filmmmakerFinance?.totalEarned || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No filmmaker data available</p>
        </div>
      )}
    </div>
  );
}
