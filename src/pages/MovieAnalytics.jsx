import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, TrendingUp, Eye, Download, DollarSign, Users } from 'lucide-react';

function MovieAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { userMovies } = useSelector((state) => state.movies);

  const movie = userMovies?.find((m) => m.id === id);

  // Check authorization
  useEffect(() => {
    if (movie && movie.userId !== user?.id) {
      navigate('/unauthorized');
    }
  }, [movie, user?.id, navigate]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Movie not found</p>
          <button
            onClick={() => navigate('/dashboard/filmmaker')}
            className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Sample analytics data (in production, this would come from Redux/API)
  const analytics = {
    totalViews: movie.views || 0,
    totalDownloads: movie.downloads || 0,
    totalRevenue: movie.revenue || 0,
    avgRating: movie.avgRating || 0,
    viewers: movie.viewers || 0,
    watchTime: movie.watchTime || '0h',
    completionRate: movie.completionRate || 0,
  };

  const stats = [
    {
      icon: Eye,
      label: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      color: 'blue',
    },
    {
      icon: Download,
      label: 'Total Downloads',
      value: analytics.totalDownloads.toLocaleString(),
      color: 'green',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      color: 'blue',
    },
    {
      icon: Users,
      label: 'Unique Viewers',
      value: analytics.viewers.toLocaleString(),
      color: 'blue',
    },
  ];

  const viewsData = [
    { date: 'Mon', views: 45 },
    { date: 'Tue', views: 52 },
    { date: 'Wed', views: 48 },
    { date: 'Thu', views: 61 },
    { date: 'Fri', views: 55 },
    { date: 'Sat', views: 67 },
    { date: 'Sun', views: 58 },
  ];

  const maxViews = Math.max(...viewsData.map((d) => d.views));

  const revenueByRegion = [
    { region: 'Rwanda', revenue: 245.5, percentage: 45 },
    { region: 'Uganda', revenue: 180.2, percentage: 35 },
    { region: 'Kenya', revenue: 95.3, percentage: 20 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/movies')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Movies
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{movie.title} - Analytics</h1>
          <p className="text-gray-400">
            Track your movie performance and earnings over time
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Views Chart */}
          <div className="lg:col-span-2 bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6">Views This Week</h3>
            <div className="flex items-end gap-2 h-48">
              {viewsData.map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${(data.views / maxViews) * 100}%`,
                    }}
                  />
                  <p className="text-gray-400 text-xs mt-2">{data.date}</p>
                  <p className="text-gray-300 text-xs font-semibold">{data.views}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Type */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Watch</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Download</span>
                  <span className="font-semibold">35%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: '35%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Region */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-6">Revenue by Region</h3>
          <div className="space-y-4">
            {revenueByRegion.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.region}</span>
                  <span className="text-gray-400">${item.revenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      idx === 0
                        ? 'bg-blue-400'
                        : idx === 1
                        ? 'bg-blue-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Avg Rating */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Average Rating</p>
            <p className="text-3xl font-bold mb-2">{analytics.avgRating.toFixed(1)}/5.0</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < Math.floor(analytics.avgRating)
                      ? 'bg-blue-400'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Watch Time */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Watch Time</p>
            <p className="text-3xl font-bold">{analytics.watchTime}</p>
            <p className="text-gray-400 text-sm mt-2">across all viewers</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Completion Rate</p>
            <p className="text-3xl font-bold">{analytics.completionRate}%</p>
            <p className="text-gray-400 text-sm mt-2">viewers finished watching</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieAnalytics;
