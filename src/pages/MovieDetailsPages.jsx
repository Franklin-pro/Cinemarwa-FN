import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, Play, Download, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { moviesAPI } from '../services/api/movies';

function MovieDetailsPages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pricing structure
  const pricing = {
    watch: movie?.price ? (movie.price * 0.8).toFixed(2) : '2.99',
    download: movie?.price ? movie.price.toFixed(2) : '4.99',
  };

  // Fetch movie data
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if ID is MongoDB ID (24 chars) or TMDB ID
        if (id.length === 24) {
          // Backend movie
          const response = await moviesAPI.getMovieById(id);
          setMovie(response.data);
        } else {
          // TMDB movie - fetch from TMDB API
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
          );
          const data = await response.json();
          setMovie(data);
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  // Handle watch button
  const handleWatchClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }
    navigate(`/payment/${id}?type=watch`);
  };

  // Handle download button
  const handleDownloadClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }
    navigate(`/payment/${id}?type=download`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800/60 border border-gray-700 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate rating
  const rating = Math.round((movie.vote_average || movie.avgRating || 0) / 2);
  const reviewCount = movie.vote_count || movie.totalReviews || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/movie/${id}`)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <div className="bg-gray-700 rounded-xl overflow-hidden aspect-video md:aspect-auto sticky top-6">
              {movie.poster_path || movie.poster ? (
                <img
                  src={
                    (movie.poster_path || movie.poster)?.startsWith('http')
                      ? movie.poster_path || movie.poster
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.poster}`
                  }
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Poster Available
                </div>
              )}
            </div>
          </div>

          {/* Movie Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title || movie.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating
                          ? 'text-blue-400 fill-blue-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {(movie.vote_average || movie.avgRating || 0).toFixed(1)} ({reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              {movie.release_date && (
                <p className="text-gray-400 text-sm">
                  Released: {new Date(movie.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Movie Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-800/40 border border-gray-700 rounded-lg p-4">
              {movie.runtime && (
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white font-semibold">{movie.runtime} minutes</p>
                </div>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm">Genres</p>
                  <p className="text-white font-semibold">
                    {movie.genres.map((g) => g.name || g).join(', ')}
                  </p>
                </div>
              )}
              {movie.status && (
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-semibold capitalize">{movie.status}</p>
                </div>
              )}
              {movie.budget && (
                <div>
                  <p className="text-gray-400 text-sm">Budget</p>
                  <p className="text-white font-semibold">${(movie.budget / 1000000).toFixed(0)}M</p>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview || movie.description || 'No synopsis available'}
              </p>
            </div>

            {/* Purchase Section */}
            <div className="border-t border-gray-700 pt-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-3">Get Access</h2>
                {!user && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <p className="text-blue-200 text-sm">
                      Please log in to purchase or watch this movie
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Watch Button */}
                <button
                  onClick={handleWatchClick()}
                  className="w-full flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-black px-6 py-4 rounded-lg font-semibold transition-all group"
                >
                  <span>Watch Online (48 hours) - ${pricing.watch}</span>
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownloadClick()}
                  className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-semibold transition-all group"
                >
                  <span>Download (Keep Forever) - ${pricing.download}</span>
                  <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Info */}
              <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 space-y-1">
                <p>✓ Instant access after payment</p>
                <p>✓ Secure payment with MoMo</p>
                <p>✓ 30-day refund guarantee for downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsPages;