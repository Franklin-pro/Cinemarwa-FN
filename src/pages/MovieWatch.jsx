import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Clock,
  ArrowLeft, Download, Share2, CheckCircle, Lock, AlertCircle,
  Loader, RefreshCw, Star, Calendar, Globe, Users, ChevronDown
} from 'lucide-react';
import AuthPromptModal from '../components/AuthPromptModal';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import moviesService from '../services/api/movies';

function MovieWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Video player state
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const detailsSectionRef = useRef(null);
  
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    buffering: false,
    showControls: true,
    hasStarted: false,
    seeking: false,
    playerError: null
  });

  // Fetch movie data
useEffect(() => {
  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace this with your actual API call
      const response = await moviesService.getMovieById(id);
      console.log(response);
      
      // The response is already parsed, so don't call .json()
      // Check if the request was successful
      if (response.status !== 200) {
        throw new Error('Failed to fetch movie');
      }
      
      // Access the data from the response structure
      const result = response.data;
      
      // Check if the API call was successful
      if (!result.success) {
        throw new Error('Failed to fetch movie data');
      }
      
      // Extract the movie data - adjust this based on your actual API structure
      const movieData = result.data || result;
      setMovie(movieData);
      
      // Determine streaming URL based on access
      if (movieData.userAccess?.hasAccess || user?.role === 'admin') {
        setStreamingUrl(movieData.videoUrl || movieData.streamingUrl);
        setHasAccess(true);
      } else if (movieData.viewPrice === 0) {
        setStreamingUrl(movieData.videoUrl || movieData.streamingUrl);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      
    } catch (err) {
      console.error('Error fetching movie:', err);
      
      // Fallback mock data for development
      const mockMovie = {
        id,
        title: "Iron Man",
        description: "Description here...",
        videoDuration: 7560,
        videoQuality: "1080p",
        viewPrice: 300,
        currency: "RWF",
        categories: ["Action", "Sci-Fi"],
        totalViews: 79,
        vote_average: 8.0,
        totalReviews: 0,
        release_date: "2025-12-17",
        language: "en",
        videoUrl: "https://cinemarwa.b-cdn.net/movies/videos/Iron%20Man-1080P-1dfd1344.mp4"
      };
      
      setMovie(mockMovie);
      setStreamingUrl(mockMovie.videoUrl);
      setHasAccess(true); // For testing
      
      // setError(err.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
  };
  
  fetchMovie();
}, [id, user]);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamingUrl) return;

    const eventHandlers = {
      loadedmetadata: () => {
        setPlayerState(prev => ({
          ...prev,
          duration: video.duration,
          hasStarted: true
        }));
      },
      timeupdate: () => {
        if (!playerState.seeking) {
          setPlayerState(prev => ({
            ...prev,
            currentTime: video.currentTime
          }));
        }
      },
      play: () => setPlayerState(prev => ({ ...prev, isPlaying: true })),
      pause: () => setPlayerState(prev => ({ ...prev, isPlaying: false })),
      waiting: () => setPlayerState(prev => ({ ...prev, buffering: true })),
      playing: () => setPlayerState(prev => ({ ...prev, buffering: false })),
      error: (e) => {
        console.error('Video error:', e);
        setPlayerState(prev => ({
          ...prev,
          playerError: 'Failed to load video. Please check your connection.'
        }));
      },
      seeking: () => setPlayerState(prev => ({ ...prev, seeking: true })),
      seeked: () => setPlayerState(prev => ({ ...prev, seeking: false })),
      volumechange: () => {
        setPlayerState(prev => ({
          ...prev,
          volume: video.volume,
          isMuted: video.muted
        }));
      }
    };

    // Attach all event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Set initial properties
    video.playbackRate = playerState.playbackRate;
    video.volume = playerState.volume;
    video.muted = playerState.isMuted;

    // Load the video
    video.load();

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [streamingUrl, playerState.seeking]);

  // Controls auto-hide
  useEffect(() => {
    if (playerState.isPlaying && playerState.showControls && !playerState.buffering) {
      controlsTimeoutRef.current = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playerState.isPlaying, playerState.showControls, playerState.buffering]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Player controls
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasAccess && !user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!hasAccess && user) {
      navigate(`/payment/${id}?type=movie_watch`);
      return;
    }

    if (playerState.isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play failed:', err);
        if (err.name === 'NotAllowedError') {
          // Handle autoplay restrictions
          setPlayerState(prev => ({ 
            ...prev, 
            playerError: 'Please click play again. Some browsers require user interaction.' 
          }));
        }
      });
    }
  };

  const handleSeekStart = () => {
    setPlayerState(prev => ({ ...prev, seeking: true }));
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  const handleSeekEnd = (e) => {
    const video = videoRef.current;
    const time = parseFloat(e.target.value);
    if (video) {
      video.currentTime = time;
    }
    setPlayerState(prev => ({ ...prev, seeking: false }));
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    const video = videoRef.current;
    
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
      setPlayerState(prev => ({
        ...prev,
        volume,
        isMuted: volume === 0
      }));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    
    // If unmuting and volume is 0, set to default
    if (!newMuted && video.volume === 0) {
      video.volume = 0.7;
      setPlayerState(prev => ({ ...prev, volume: 0.7 }));
    }
    
    setPlayerState(prev => ({
      ...prev,
      isMuted: newMuted
    }));
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  const handleMouseMove = () => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const scrollToDetails = () => {
    detailsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!hasAccess) {
      if (!user) setShowAuthPrompt(true);
      else navigate(`/payment/${id}?type=movie_download`);
      return;
    }
    
    // Download logic
    const link = document.createElement('a');
    link.href = streamingUrl;
    link.download = `${movie?.title || 'movie'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/watch/${id}`;
    const shareText = `Watch "${movie?.title}" on our platform!`;
    
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: shareText,
        url: shareUrl,
      }).catch(err => {
        console.error('Share error:', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Copy error:', err);
      });
    }
  };

  const retryPlayer = () => {
    setPlayerState(prev => ({ ...prev, playerError: null }));
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(err => {
        console.error('Retry failed:', err);
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-300 mt-4">Loading cinematic experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {error}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        movieTitle={movie.title}
      />

      {/* Scroll Arrow */}
      <button
        onClick={scrollToDetails}
        className="fixed bottom-6 right-6 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all animate-bounce"
        aria-label="Scroll to details"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {/* Player Section - Fixed height */}
      <div 
        ref={playerContainerRef}
        className="relative w-full h-[70vh] min-h-[500px] bg-black"
        onMouseMove={handleMouseMove}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Access Status Badge */}
        {user && (
          <div className="absolute top-4 right-4 z-20">
            {hasAccess ? (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Access Granted</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Purchase Required</span>
              </div>
            )}
          </div>
        )}

        {/* Video Player */}
        <div className="relative w-full h-full flex items-center justify-center">
          {playerState.playerError ? (
            <div className="text-center p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Playback Error
              </h3>
              <p className="text-gray-300 mb-6">{playerState.playerError}</p>
              <button
                onClick={retryPlayer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : streamingUrl && hasAccess ? (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={streamingUrl}
                playsInline
                onClick={handlePlayPause}
              >
                <source src={streamingUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Overlay Controls */}
              {(playerState.showControls || !playerState.isPlaying || playerState.buffering) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none">
                  {/* Center Play Button - Shows when paused */}
                  {!playerState.isPlaying && !playerState.buffering && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handlePlayPause}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-full shadow-2xl transform hover:scale-105 transition-all pointer-events-auto"
                      >
                        <Play className="w-12 h-12" />
                      </button>
                    </div>
                  )}

                  {/* Buffering Overlay */}
                  {playerState.buffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                        <p className="text-gray-300 mt-2">Buffering...</p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 pointer-events-auto">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={playerState.duration || 100}
                        value={playerState.currentTime}
                        onChange={handleSeek}
                        onMouseDown={handleSeekStart}
                        onMouseUp={handleSeekEnd}
                        onTouchStart={handleSeekStart}
                        onTouchEnd={handleSeekEnd}
                        className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>{formatTime(playerState.currentTime)}</span>
                        <span>{formatTime(playerState.duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="hover:bg-white/20 p-2 rounded-full transition-colors"
                          disabled={playerState.buffering}
                        >
                          {playerState.buffering ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : playerState.isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="hover:bg-white/20 p-2 rounded-full transition-colors"
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
                            step="0.01"
                            value={playerState.isMuted ? 0 : playerState.volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="text-sm font-medium">
                          {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePlaybackRateChange(
                            playerState.playbackRate === 1 ? 1.5 : 1
                          )}
                          className="text-sm font-medium hover:bg-white/20 px-3 py-1 rounded transition-colors"
                        >
                          {playerState.playbackRate}x
                        </button>
                        
                        <button
                          onClick={toggleFullscreen}
                          className="hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                          <Maximize className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No Streaming URL/No Access State
            <div className="text-center p-8 max-w-lg">
              <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {hasAccess ? 'Video Unavailable' : 'Purchase Required'}
              </h3>
              <p className="text-gray-300 mb-6">
                {hasAccess 
                  ? 'The streaming link for this movie is currently unavailable.'
                  : `Purchase access to watch "${movie.title}" in ${movie.videoQuality || 'HD'} quality.`
                }
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => user 
                    ? navigate(`/payment/${id}?type=movie_watch`)
                    : setShowAuthPrompt(true)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {user ? 'Purchase Access' : 'Login to Purchase'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Details Section - Scrollable */}
      <div 
        ref={detailsSectionRef}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Movie Info Card */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-300">
                    {movie.vote_average && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(movie.vote_average / 2)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                        <span>{movie.vote_average?.toFixed(1)}/10</span>
                      </div>
                    )}
                    
                    {movie.videoDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(movie.videoDuration)}
                      </span>
                    )}
                    
                    {movie.release_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  
                  {hasAccess && streamingUrl && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* Genres/Tags */}
              {movie.categories && movie.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.categories.map((category, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {movie.description || 'No description available.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
                {movie.language && (
                  <div>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Language
                    </p>
                    <p className="text-white font-semibold text-lg">
                      {movie.language.toUpperCase()}
                    </p>
                  </div>
                )}
                
                {movie.totalViews !== undefined && (
                  <div>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Views
                    </p>
                    <p className="text-white font-semibold text-lg">
                      {movie.totalViews?.toLocaleString() || '0'}
                    </p>
                  </div>
                )}
                
                {movie.videoQuality && (
                  <div>
                    <p className="text-gray-400 text-sm">Quality</p>
                    <p className="text-white font-semibold text-lg">{movie.videoQuality}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-semibold text-lg">
                    {hasAccess ? 'Available' : 'Locked'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-8">
              {hasAccess && user && <ReviewForm movieId={id} />}
              <ReviewList movieId={id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Access Info Card */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Access Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Your Status</p>
                  <p className={`text-lg font-semibold ${hasAccess ? 'text-green-500' : 'text-yellow-500'}`}>
                    {hasAccess ? 'Access Granted' : 'Access Required'}
                  </p>
                </div>
                
                {!hasAccess && movie.viewPrice && (
                  <div>
                    <p className="text-gray-400 text-sm">Watch Price</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {movie.currency || 'RWF'} {movie.viewPrice}
                    </p>
                  </div>
                )}
                
                {movie.videoQuality && (
                  <div>
                    <p className="text-gray-400 text-sm">Quality</p>
                    <p className="text-white font-semibold">{movie.videoQuality}</p>
                  </div>
                )}
                
                {movie.videoDuration && (
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold">
                      {formatTime(movie.videoDuration)}
                    </p>
                  </div>
                )}
              </div>
              
              {!hasAccess && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => user 
                      ? navigate(`/payment/${id}?type=movie_watch`)
                      : setShowAuthPrompt(true)
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
                  >
                    {user ? 'Purchase Stream Access' : 'Login to Purchase'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Movie Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Views</span>
                  <span className="font-semibold">
                    {movie.totalViews?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-semibold">
                    {movie.vote_average?.toFixed(1) || 'N/A'}/10
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-semibold">
                    {movie.totalReviews || movie.vote_count || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieWatch;