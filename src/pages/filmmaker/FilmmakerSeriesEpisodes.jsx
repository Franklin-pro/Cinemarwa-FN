import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Film, Calendar, Eye, DollarSign } from "lucide-react";
import { filmmmakerService } from "../../services/api/filmmaker";

function FilmmakerSeriesEpisodes() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    fetchSeriesEpisodes();
  }, [seriesId]);

  const fetchSeriesEpisodes = async () => {
    try {
      setLoading(true);
      // You'll need to create this API endpoint
      const response = await filmmmakerService.getSeriesEpisodes(seriesId);
      
      if (response.data?.success) {
        setSeries(response.data.data.series);
        setEpisodes(response.data.data.episodes || []);
      }
    } catch (error) {
      console.error("Error fetching series episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const formatNumber = (value) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {series?.title || "Series Episodes"}
                </h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {episodes.length} episodes • {series?.totalSeasons || 1} season(s)
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/filmmaker/series/${seriesId}/edit`)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Edit Series
              </button>
              <button
                onClick={() => navigate(`/dashboard/filmmaker/upload-episode?seriesId=${seriesId}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Episode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Series Info */}
        {series && (
          <div className={`mb-8 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-sm border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } p-6`}>
            <div className="flex items-start gap-6">
              <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={series.poster || series.backdrop}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {series.title}
                </h2>
                <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {series.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Status</p>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {series.status?.charAt(0).toUpperCase() + series.status?.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Views</p>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatNumber(series.totalViews || 0)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Revenue</p>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      RWF {formatCurrency(series.totalRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rating</p>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {parseFloat(series.avgRating || 0).toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Episodes List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Episodes ({episodes.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/dashboard/filmmaker/upload-episode?seriesId=${seriesId}&season=${1}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Episode to Season 1
              </button>
            </div>
          </div>

          {episodes.length === 0 ? (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } p-12 text-center`}>
              <Film className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                No Episodes Yet
              </h3>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Add episodes to your series to get started
              </p>
              <button
                onClick={() => navigate(`/dashboard/filmmaker/upload-episode?seriesId=${seriesId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Add First Episode
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl border ${
                    darkMode ? "border-gray-700 hover:border-blue-500" : "border-gray-200 hover:border-blue-500"
                  } transition-colors`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={episode.poster || episode.backdrop || series?.poster}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -mt-6 ml-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                            S{episode.seasonNumber || 1}E{episode.episodeNumber || 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {episode.title}
                            </h3>
                            <p className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {episode.description || "No description available"}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/filmmaker/episodes/${episode.id}/edit`)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                              title="Edit Episode"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this episode?")) {
                                  // Handle delete
                                }
                              }}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-red-900/30 hover:bg-red-800/30 text-red-400"
                                  : "bg-red-100 hover:bg-red-200 text-red-600"
                              }`}
                              title="Delete Episode"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Eye className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              {formatNumber(episode.totalViews || 0)} views
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              RWF {formatCurrency(episode.totalRevenue || 0)} revenue
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              {formatDate(episode.createdAt)}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              episode.status === "approved"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : episode.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                              {episode.status?.charAt(0).toUpperCase() + episode.status?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilmmakerSeriesEpisodes;