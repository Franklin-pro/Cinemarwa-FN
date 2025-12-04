import React, { useEffect, useState } from 'react';
import { Film, History, Heart, DollarSign, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { moviesService } from '../../services/api/movies';

function ViewDashboard() {
  const navigate = useNavigate();
  const [purchasedMovies, setPurchasedMovies] = useState([]);
  const [stats, setStats] = useState({
    totalPurchased: 0,
    totalSpent: 0,
    watchedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    fetchViewerData();
  }, []);

  const fetchViewerData = async () => {
    try {
      setLoading(true);
      // Fetch purchased movies
      const moviesRes = await moviesService.getUserPurchasedMovies();
      const movies = moviesRes.data.data?.movies || [];

      setPurchasedMovies(movies);

      // Calculate stats
      setStats({
        totalPurchased: movies.length,
        totalSpent: movies.reduce((sum, m) => sum + (m.viewPrice || 0), 0),
        watchedCount: movies.filter(m => m.watched).length,
      });
    } catch (err) {
      console.error('Error fetching viewer data:', err);
      setError('Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchMovie = (movieId) => {
    navigate(`/watch/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-400 mb-4">{error}</p>
          <button
            onClick={fetchViewerData}
            className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-400">Your purchased movies and payment history</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <Film className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Movies Purchased</p>
            <p className="text-3xl font-bold">{stats.totalPurchased}</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Total Spent</p>
            <p className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Watched</p>
            <p className="text-3xl font-bold">{stats.watchedCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('movies')}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === 'movies'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            My Movies
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Payment History
          </button>
        </div>

        {/* MOVIES TAB */}
        {activeTab === 'movies' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Purchased Movies</h2>
            {purchasedMovies.length === 0 ? (
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-12 text-center">
                <Film className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">You haven't purchased any movies yet</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold"
                >
                  Browse Movies
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                {purchasedMovies.map((movie) => (
                  <div
                    key={movie._id}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:border-blue-500 border border-gray-700 transition-all group cursor-pointer"
                    onClick={() => handleWatchMovie(movie._id)}
                  >
                    <div className="aspect-video bg-gray-700 flex items-center justify-center overflow-hidden relative">
                      {movie.poster_path ? (
                        <img
                          src={
                            movie.poster_path?.startsWith('http')
                              ? movie.poster_path
                              : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Film className="w-8 h-8 text-gray-500" />
                      )}

                      {/* Watch button overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold transition-all">
                          Watch Now
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-semibold truncate">{movie.title}</p>
                      <div className="text-xs text-gray-400">
                        <p>Price Paid: ${movie.viewPrice || 0}</p>
                        <p className={movie.watched ? 'text-green-400' : 'text-orange-400'}>
                          {movie.watched ? '✓ Watched' : 'Not Yet Watched'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Payment History</h2>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Movie</th>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {purchasedMovies.length > 0 ? (
                      purchasedMovies.map((movie) => (
                        <tr key={movie._id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">{movie.title}</td>
                          <td className="px-6 py-4">
                            {movie.purchaseDate
                              ? new Date(movie.purchaseDate).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-semibold">${movie.viewPrice || 0}</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                          No payment history yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewDashboard;