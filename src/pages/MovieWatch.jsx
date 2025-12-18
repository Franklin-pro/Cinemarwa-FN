import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Download, Share2, ArrowLeft, Star, Pause, Volume2, VolumeX, Maximize, Settings, Clock, AlertCircle } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { moviesAPI } from '../services/api/movies';
import { getMovieDetails as getTMDBMovieDetails } from '../services/api';
// import { updateMovieViews } from '../store/slices/moviesSlice';
import AuthPromptModal from '../components/AuthPromptModal';

function MovieWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { purchasedMovies, watchHistory } = useSelector((state) => state.movies);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayerControls, setShowPlayerControls] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    quality: 'auto'
  });

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // 🔥 AUTOMATIC ACCESS CHECKING - No API call needed
  useEffect(() => {
    if (movie && user && purchasedMovies) {
      // Check if user has purchased this movie
      const purchased = purchasedMovies.find(m => m.movieId === id || m.id === id);
      
      // Also check if user has any successful payment for this movie
      const hasPurchased = purchasedMovies.some(payment => 
        payment.movieId === id && 
        payment.paymentStatus === 'succeeded'
      );
      
      // Check watch history for temporary access (48 hours)
      const watchEntry = watchHistory?.find(entry => entry.movieId === id);
      if (watchEntry) {
        const now = new Date();
        const expiresAt = new Date(watchEntry.expiresAt);
        if (now < expiresAt) {
          setHasAccess(true);
          return;
        }
      }
      
      setHasAccess(purchased || hasPurchased);
    } else if (!user) {
      setHasAccess(false);
    }
  }, [movie, user, purchasedMovies, id, watchHistory]);

  // Fetch movie details and streaming URL
  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        setError(null);
        
        // Check if it's a backend movie (UUID or MongoDB ID) or TMDB movie (numeric ID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const isMongoId = /^[a-f0-9]{24}$/.test(id);
        const isTmdbId = /^\d+$/.test(id);
        const isBackendMovie = isUuid || isMongoId;

        let movieData = null;
        
        if (isBackendMovie) {
          // Fetch from backend API
          try {
            const response = await moviesAPI.getMovieById(id);
            movieData = response.data.data;
            
            // Check if user has access before getting streaming URL
            if (hasAccess || user?.role === 'admin') {
              // Get streaming URL for backend movies
              if (movieData?.streamingUrl) {
                setVideoUrl(movieData.streamingUrl);
              } else if (movieData?.videoUrl) {
                setVideoUrl(movieData.videoUrl);
              } else if (movieData?.hlsUrl) {
                // Generate secure HLS URL if needed
                const hlsUrl = await generateSecureHlsUrl(id);
                setVideoUrl(hlsUrl);
              }
            }
          } catch (err) {
            console.error('❌ Backend API error:', err);
            throw new Error('Failed to load movie from server');
          }
        } else if (isTmdbId) {
          // For TMDB movies
          movieData = await getTMDBMovieDetails(id);
          
          // For TMDB movies, we'll use trailer as preview
          // In production, you'd have actual streaming URLs
        } else {
          throw new Error('Invalid movie ID format');
        }

        setMovie(movieData);
        
        // Update views if user has access
        if (hasAccess && movieData?.id) {
          // dispatch(updateMovieViews(movieData.id));
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error.message || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    }

    fetchMovieDetails();
  }, [id, user, hasAccess, dispatch]);

  // Generate secure HLS URL
  const generateSecureHlsUrl = async (movieId) => {
    if (!user) return null;
    
    try {
      const response = await moviesAPI.getSecureStreamUrl(movieId, user.id);
      if (response.data.success) {
        return response.data.url;
      }
    } catch (error) {
      console.error('Error generating secure URL:', error);
    }
    return null;
  };

  // Player controls timeout
  useEffect(() => {
    if (isPlaying && showPlayerControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowPlayerControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showPlayerControls]);

  // Handle video events
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setPlayerState(prev => ({
      ...prev,
      currentTime: videoRef.current.currentTime,
      duration: videoRef.current.duration
    }));
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setPlayerState(prev => ({ ...prev, currentTime: seekTime }));
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const volume = parseFloat(e.target.value);
    videoRef.current.volume = volume;
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setPlayerState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setPlayerState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWatchClick = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!hasAccess) {
      navigate(`/payment/${id}?type=movie_watch`);
      return;
    }
    
    // User has access, start playing
    if (videoRef.current) {
      videoRef.current.play();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      setIsPlaying(true);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/movie/${id}`;
    const shareText = `Watch "${movie?.title}" on our platform!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  const handleMouseMove = () => {
    setShowPlayerControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Movie</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        movieTitle={movie?.title}
      />

      {/* Video Player Area */}
      <div 
        ref={playerContainerRef}
        className="relative w-full h-screen bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
              setShowPlayerControls(false);
            }, 1000);
          }
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Video Player */}
        <div className="w-full h-full flex items-center justify-center">
          {videoUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={() => setPlayerState(prev => ({ ...prev, isPlaying: false }))}
                controls={false}
              />
              
              {/* Custom Player Controls */}
              {(showPlayerControls || !playerState.isPlaying) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max={playerState.duration || 100}
                      value={playerState.currentTime || 0}
                      onChange={handleSeek}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-300 mt-1">
                      <span>{formatTime(playerState.currentTime)}</span>
                      <span>{formatTime(playerState.duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePlayPause}
                        className="p-2 hover:bg-white/10 rounded-full"
                      >
                        {playerState.isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/10 rounded-full"
                        >
                          {playerState.isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={playerState.volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                      </div>

                      <div className="text-sm">
                        {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="p-2 hover:bg-white/10 rounded-full">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-full"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Play Overlay - Shows when video is paused or not started */}
              {!playerState.isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  {hasAccess ? (
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-black px-8 py-4 rounded-full text-lg font-semibold transition-all"
                    >
                      <Play className="w-8 h-8" />
                      Play Movie
                    </button>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-4">Access Required</h3>
                      <p className="text-gray-300 mb-6">Purchase this movie to start watching</p>
                      <button
                        onClick={handleWatchClick}
                        className="bg-blue-500 hover:bg-blue-600 text-black px-8 py-3 rounded-lg font-semibold text-lg"
                      >
                        Watch Now - {movie.currency || 'RWF'} {movie.viewPrice}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Streaming Not Available</h3>
              <p className="text-gray-300 mb-6">This movie is not available for streaming yet.</p>
              {movie.viewPrice && !hasAccess && (
                <button
                  onClick={handleWatchClick}
                  className="bg-blue-500 hover:bg-blue-600 text-black px-8 py-3 rounded-lg font-semibold text-lg"
                >
                  Purchase to Watch - {movie.currency || 'RWF'} {movie.viewPrice}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Movie Details and Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Movie Details */}
            <div className="bg-gray-900 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    {movie.avgRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={`${
                                i < Math.floor(movie.avgRating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-300">{movie.avgRating}/5</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-gray-300">
                      {movie.videoDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {movie.videoDuration > 3600 
                            ? `${Math.floor(movie.videoDuration / 3600)}h ${Math.floor((movie.videoDuration % 3600) / 60)}m`
                            : `${Math.floor(movie.videoDuration / 60)}m`
                          }
                        </span>
                      )}
                      {movie.release_date && (
                        <span>{movie.release_date.split('-')[0]}</span>
                      )}
                      {movie.adult && (
                        <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded">18+</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  
                  {!hasAccess && movie.viewPrice && (
                    <button
                      onClick={handleWatchClick}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Watch Now - {movie.currency || 'RWF'} {movie.viewPrice}
                    </button>
                  )}
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(movie.genres || movie.categories || []).map((genre, idx) => (
                  <span
                    key={genre.id || idx}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name || genre}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview || "No description available."}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
                {movie.director && (
                  <div>
                    <p className="text-gray-400 text-sm">Director</p>
                    <p className="font-semibold">{movie.director}</p>
                  </div>
                )}
                {movie.language && (
                  <div>
                    <p className="text-gray-400 text-sm">Language</p>
                    <p className="font-semibold">{movie.language}</p>
                  </div>
                )}
                {movie.views !== undefined && (
                  <div>
                    <p className="text-gray-400 text-sm">Views</p>
                    <p className="font-semibold">{movie.views?.toLocaleString() || '0'}</p>
                  </div>
                )}
                {movie.filmmaker && (
                  <div>
                    <p className="text-gray-400 text-sm">Filmmaker</p>
                    <p className="font-semibold">{movie.filmmaker.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            {user && hasAccess && <ReviewForm movieId={id} />}

            {/* Reviews List */}
            <ReviewList movieId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-gray-900 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Movie Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`text-lg font-semibold ${hasAccess ? 'text-green-500' : 'text-yellow-500'}`}>
                    {hasAccess ? 'Purchased' : 'Available for Purchase'}
                  </p>
                </div>
                
                {movie.viewPrice && (
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {movie.currency || 'RWF'} {movie.viewPrice}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-400 text-sm">Quality</p>
                  <p className="text-white font-semibold">HD • 1080p</p>
                </div>
                
                {movie.videoDuration && (
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold">
                      {movie.videoDuration > 3600 
                        ? `${Math.floor(movie.videoDuration / 3600)}h ${Math.floor((movie.videoDuration % 3600) / 60)}m`
                        : `${Math.floor(movie.videoDuration / 60)}m`
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {!hasAccess && (
                <button
                  onClick={handleWatchClick}
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  {user ? 'Purchase Now' : 'Login to Purchase'}
                </button>
              )}
            </div>

            {/* Filmmaker Info */}
            {movie.filmmaker && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Filmmaker</h3>
                <div className="flex items-start gap-4">
                  {movie.filmmaker.avatar && (
                    <img
                      src={movie.filmmaker.avatar}
                      alt={movie.filmmaker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{movie.filmmaker.name}</h4>
                    {movie.filmmaker.bio && (
                      <p className="text-gray-300 text-sm mt-2">{movie.filmmaker.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieWatch;