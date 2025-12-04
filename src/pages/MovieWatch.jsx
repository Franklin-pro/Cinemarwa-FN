import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Download, Share2, ArrowLeft, Star } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

function MovieWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userMovies } = useSelector((state) => state.movies);
  const [isPlaying, setIsPlaying] = useState(false);
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    // Try to find the movie from Redux store
    if (userMovies && userMovies.length > 0) {
      const foundMovie = userMovies.find((m) => m.id === id);
      if (foundMovie) {
        setMovie(foundMovie);
      }
    }

    // If not found, create a placeholder
    if (!movie) {
      setMovie({
        id,
        title: 'Movie Title',
        description: 'Movie description goes here',
        duration: '2h 15m',
        rating: 4.5,
        genre: 'Action',
        director: 'Director Name',
        year: 2024,
      });
    }
  }, [id, userMovies, movie]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Player Area */}
      <div className="relative w-full h-screen bg-gray-900">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Video Player */}
        {isPlaying ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Video player component goes here</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-black px-8 py-4 rounded-full text-lg font-semibold transition-all"
            >
              <Play className="w-6 h-6" />
              Play Movie
            </button>
          </div>
        )}

        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{movie?.title || 'Movie Title'}</h2>
              <p className="text-gray-300">{movie?.duration || '2h 15m'}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                <Download className="w-5 h-5" />
                Download
              </button>
              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews and Details Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Movie Details */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{movie?.title}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={`${
                            i < Math.floor(movie?.rating || 0)
                              ? 'fill-blue-400 text-blue-400'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300">{movie?.rating || 4.5}/5</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-300">
                <p><span className="font-semibold">Genre:</span> {movie?.genre}</p>
                <p><span className="font-semibold">Director:</span> {movie?.director}</p>
                <p><span className="font-semibold">Year:</span> {movie?.year}</p>
                <p><span className="font-semibold">Duration:</span> {movie?.duration}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 leading-relaxed">{movie?.description}</p>
              </div>
            </div>

            {/* Review Form */}
            {user && <ReviewForm movieId={id} />}

            {/* Reviews List */}
            <ReviewList movieId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <p className="text-gray-400">Views</p>
                  <p className="text-xl font-semibold text-white">
                    {movie?.views?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Rating</p>
                  <p className="text-xl font-semibold text-blue-400">
                    {movie?.rating || 'N/A'}/5
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Released</p>
                  <p className="text-white font-semibold">{movie?.year || 'N/A'}</p>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 rounded-lg transition-colors">
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieWatch;