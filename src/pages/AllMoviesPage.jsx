import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Film, Tv, Loader, AlertCircle } from 'lucide-react';
import { moviesAPI } from '../services/api/movies';

function AllMoviesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [type]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await moviesAPI.getAllMovies();
      let allMovies = response.data.data.movies || [];
      
      // Filter based on type
      if (type === 'movie') {
        allMovies = allMovies.filter(m => m.contentType === 'movie');
      } else if (type === 'series') {
        allMovies = allMovies.filter(m => m.contentType === 'series' || m.contentType === 'serie');
      }
      
      setMovies(allMovies);
    } catch (err) {
      setError('Failed to load content',err);
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (type === 'movie') return 'All Movies';
    if (type === 'series') return 'All Series';
    return 'All Content';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{getTitle()}</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/movies?type=all')}
              className={`px-4 py-2 rounded-lg transition ${type === 'all' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => navigate('/movies?type=movie')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${type === 'movie' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <Film className="w-4 h-4" /> Movies
            </button>
            <button
              onClick={() => navigate('/movies?type=series')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${type === 'series' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <Tv className="w-4 h-4" /> Series
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No content found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={movie.poster || 'https://via.placeholder.com/300x450'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
                      {movie.contentType && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-300">
                          {movie.contentType === 'series' || movie.contentType === 'serie' ? (
                            <><Tv className="w-3 h-3" /> Series</>
                          ) : (
                            <><Film className="w-3 h-3" /> Movie</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllMoviesPage;
