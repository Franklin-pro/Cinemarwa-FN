import { Play, X, Star, Tv, Film, Calendar, Check, ThumbsUp, ThumbsDown, Plus, Share2 } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { getMovieDetails, getMovieVideos } from "../services/api";
import { moviesService } from "../services/api/movies";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthPromptModal from "./AuthPromptModal";
import { useGuestVideoTimer } from "../hooks/useGuestVideoTimer";
import { shareMovies } from "../store/slices/movieSlice";

function MovieDetails({ movieId, onclose }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [liked, setLiked] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showPaymentSuggestion, setShowPaymentSuggestion] = useState(false);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [trailerTimeRemaining, setTrailerTimeRemaining] = useState(60);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const navigate = useNavigate();
  const trailerTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Guest user timer - shows modal after 10 seconds of watching
  const isGuest = !token;
  const { timeLeft, hasReachedLimit } = useGuestVideoTimer(
    isGuest,
    isPlaying,
    () => setShowAuthPrompt(true)
  );

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(movieId);
  const isMongoId = /^[a-f0-9]{24}$/.test(movieId);
  const isTmdbId = /^\d+$/.test(movieId);
  const isBackendMovie = isUuid || isMongoId;

  useEffect(() => {
    if (!movieId) return;
    
    async function getMovieDetail() {
      try {
        setLoading(true);
        let movieData = null;
        let episodesData = [];
        let seasonsData = [];

        if (isBackendMovie) {
          try {
            const response = await moviesService.getMovie(movieId);
            movieData = response.data.data;
            
            // Check if it's a series and fetch episodes
            if (movieData?.contentType === "series") {
              episodesData = movieData.episodes || generateMockEpisodes(movieData);
              seasonsData = movieData.seasons || getSeasonsFromEpisodes(episodesData);
            }
          } catch (err) {
            console.error("❌ Backend API error for movie ID:", movieId, err.message);
            setError(true);
            return;
          }
        } else if (isTmdbId) {
          movieData = await getMovieDetails(movieId);
        } else {
          console.error("❌ Invalid movieId format:", movieId);
          setError(true);
          return;
        }

        setMovie(movieData);
        setEpisodes(episodesData);
        setSeasons(seasonsData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    getMovieDetail();
  }, [movieId, token]);

  // Start trailer countdown when trailer starts playing
  useEffect(() => {
    if (isTrailerPlaying && videoUrl) {
      setTrailerTimeRemaining(60);
      
      trailerTimerRef.current = setInterval(() => {
        setTrailerTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(trailerTimerRef.current);
            
            // Stop the video after 60 seconds
            if (videoRef.current) {
              if (typeof videoRef.current.pause === 'function') {
                videoRef.current.pause();
              }
              if (videoRef.current.tagName === 'IFRAME') {
                videoRef.current.src = '';
              }
            }
            
            // Show payment suggestion modal after a short delay
            setTimeout(() => {
              setShowPaymentSuggestion(true);
            }, 500);
            
            setIsTrailerPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (trailerTimerRef.current) {
        clearInterval(trailerTimerRef.current);
        trailerTimerRef.current = null;
      }
    }

    return () => {
      if (trailerTimerRef.current) {
        clearInterval(trailerTimerRef.current);
      }
    };
  }, [isTrailerPlaying, videoUrl]);

  // Handle video ended event for YouTube iframes
  useEffect(() => {
    const handleYouTubeEnd = (e) => {
      if (isTrailerPlaying && e.data === 0) {
        setShowPaymentSuggestion(true);
        setIsTrailerPlaying(false);
      }
    };

    if (isTrailerPlaying) {
      window.addEventListener('message', handleYouTubeEnd);
    }

    return () => {
      window.removeEventListener('message', handleYouTubeEnd);
    };
  }, [isTrailerPlaying]);

  // Helper function to generate mock episodes
  const generateMockEpisodes = (series) => {
    const mockEpisodes = [];
    const seasonsCount = Math.max(1, series.seasons?.length || Math.floor(Math.random() * 3) + 1);
    
    for (let season = 1; season <= seasonsCount; season++) {
      const episodesInSeason = Math.floor(Math.random() * 10) + 5;
      
      for (let episode = 1; episode <= episodesInSeason; episode++) {
        mockEpisodes.push({
          id: `${series.id}-s${season}e${episode}`,
          title: `Episode ${episode}`,
          episodeNumber: episode,
          seasonNumber: season,
          description: `Episode ${episode} of Season ${season}. ${series.description || "No description available."}`,
          duration: Math.floor(Math.random() * 1800) + 900,
          thumbnail: series.poster || series.poster_path,
          releaseDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          videoUrl: null,
          viewPrice: series.viewPrice || 0,
          downloadPrice: series.downloadPrice || 0,
          currency: series.currency || 'RWF'
        });
      }
    }
    
    return mockEpisodes;
  };

  // Helper function to extract seasons from episodes
  const getSeasonsFromEpisodes = (episodes) => {
    const seasonNumbers = [...new Set(episodes.map(ep => ep.seasonNumber))].sort((a, b) => a - b);
    return seasonNumbers.map(seasonNum => ({
      number: seasonNum,
      episodeCount: episodes.filter(ep => ep.seasonNumber === seasonNum).length
    }));
  };

  // Get episodes for selected season
  const episodesInSelectedSeason = episodes.filter(ep => ep.seasonNumber === selectedSeason);

  // Check if user has access to the content
  const hasAccess = movie?.userAccess?.hasAccess === true;
  const requiresPurchase = movie?.userAccess?.requiresPurchase === true;

  // In your handleShare function, fix the share link and add success feedback
const handleShare = async (platform) => {
  if (!movie) return;

  const shareData = {
    movieId: movie.id || movieId,
    platform,
    movieTitle: movie.title || movie.name,
    userId: user?.id
  };

  try {
    // Show loading state
    setShowShareOptions(false);
    
    // Dispatch the share action to store in backend
    const result = await dispatch(shareMovies(shareData)).unwrap();
    
    // Show success message
    if (result.success) {
      // Show toast/snackbar notification
      showSuccessNotification(`Shared successfully! ${result.data.pointsAwarded > 0 ? `+${result.data.pointsAwarded} points earned!` : ''}`);
    }
    
    // Also perform the actual platform sharing
    await performPlatformShare(platform);
    
  } catch (error) {
    console.error("Error sharing:", error);
    
    // Re-open share options if error
    setShowShareOptions(true);
    
    // Show error message
    if (error.message?.includes('already recorded')) {
      alert('You have already shared this movie!');
    } else {
      alert("Failed to share. Please try again.");
    }
  }
};

// Update the performPlatformShare function to use the correct URL
const performPlatformShare = async (platform) => {
  // Use the current page URL or generate a proper share URL
  const currentUrl = window.location.href;
  const shareUrl = currentUrl.includes('/movie/') 
    ? currentUrl 
    : `${window.location.origin}/movie/${movie.id}`;
  
  const title = `Check out "${movie.title || movie.name}" on our platform!`;
  // const text = `I'm watching "${movie.title || movie.name}"! ${movie.description?.substring(0, 100)}...`;

  
  switch (platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${shareUrl}`)}`, '_blank', 'width=600,height=400');
      break;
    case 'whatsapp':
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`, '_blank', 'width=800,height=600');
      break;
    case 'telegram':
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
      break;
    case 'messenger':
      window.open(`fb-messenger://share?link=${encodeURIComponent(shareUrl)}`, '_blank');
      break;
    case 'reddit':
      window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`, '_blank');
      break;
    case 'copy':
      try {
        await navigator.clipboard.writeText(shareUrl);
        showSuccessNotification('Link copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessNotification('Link copied to clipboard!');
        console.log('Error copying to clipboard:', err);
      }
      break;
    case 'native':
      if (navigator.share) {
        try {
          await navigator.share({
            title: movie.title || movie.name,
            text: `Check out "${movie.title || movie.name}" on our platform!`,
            url: shareUrl,
          });
          showSuccessNotification('Shared successfully!');
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.log('Error sharing:', err);
          }
        }
      } else {
        // Fallback to copy if native sharing not supported
        try {
          await navigator.clipboard.writeText(shareUrl);
          showSuccessNotification('Link copied to clipboard!');
        } catch (copyErr) {
          console.log('Error copying to clipboard:', copyErr);
          alert('Please manually copy the URL from your address bar.');
        }
      }
      break;
    default:
      break;
  }
};

// Add a success notification function
const showSuccessNotification = (message) => {
  // You can use a proper toast/notification library, or create a simple one:
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-slide-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('animate-slide-out');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

// Add these CSS animations to your global styles:
/*
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

.animate-slide-out {
  animation: slide-out 0.3s ease-in forwards;
}
*/

  const handleWatchTrailer = async () => {
    try {
      // TMDB - always free trailer
      if (isTmdbId) {
        const videos = await getMovieVideos(movieId);
        const trailer = videos.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          setVideoUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
          setIsTrailerPlaying(true);
          setShowTrailerModal(false);
          return;
        }

        alert("Trailer not available.");
        return;
      }

      // Backend movie - check for trailer
      if (isBackendMovie) {
        const trailerUrl = movie?.trailerUrl || movie?.youtubeTrailerLink;
        
        if (trailerUrl) {
          if (trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be')) {
            let videoId = null;
            
            if (trailerUrl.includes('youtube.com/watch?v=')) {
              const urlParams = new URLSearchParams(new URL(trailerUrl).search);
              videoId = urlParams.get('v');
            } else if (trailerUrl.includes('youtu.be/')) {
              videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
            }
            
            if (videoId) {
              setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1&modestbranding=1&rel=0`);
              setIsTrailerPlaying(true);
              setShowTrailerModal(false);
            } else {
              alert("Invalid YouTube trailer URL.");
            }
          } else {
            setVideoUrl(trailerUrl);
            setIsTrailerPlaying(true);
            setShowTrailerModal(false);
          }
        } else {
          alert("No trailer available for this movie.");
        }
      }
    } catch (error) {
      console.error("Error loading trailer:", error);
      alert("Failed to load trailer.");
    }
  };

  const handleTrailerButtonClick = () => {
    const hasTrailer = movie?.trailerUrl || movie?.youtubeTrailerLink;
    
    if (isBackendMovie && hasTrailer) {
      setShowTrailerModal(true);
    } else if (isTmdbId) {
      handleWatchTrailer();
    } else {
      alert("No trailer available.");
    }
  };

  const handleWatchNow = async () => {
    try {
      // TMDB = always free trailer
      if (isTmdbId) {
        const videos = await getMovieVideos(movieId);
        const trailer = videos.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          setVideoUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
          setIsPlaying(true);
          return;
        }

        alert("Trailer not available.");
        return;
      }

      // Backend movie → apply access rules + 60 seconds guest rules
      if (isBackendMovie) {
        if (!hasAccess) {
          if (!token) {
            navigate('/login', { state: { from: `/movie/${movieId}` } });
            return;
          }

          if (requiresPurchase) {
            handlePurchase();
            return;
          }
        }

        if (movie?.videoUrl) {
          setVideoUrl(movie.videoUrl);
          setIsPlaying(true);
          // navigate(`/watch/${movie.id}`);
        } else if (movie?.trailerUrl) {
          setVideoUrl(movie.trailerUrl);
          setIsTrailerPlaying(true);
        }
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load video.");
    }
  };

  const handleEpisodeClick = (episode) => {
    if (hasAccess) {
      alert(`Playing episode ${episode.episodeNumber} of season ${episode.seasonNumber}`);
    } else {
      if (!token) {
        navigate('/login', { state: { from: `/series/${movieId}/episode/${episode.id}` } });
        return;
      }
      handlePurchase();
    }
  };

  const handlePurchase = () => {
    setShowPaymentSuggestion(false);
    navigate(`/payment/${movieId}?type=${isSeries ? 'series_access' : 'watch'}`);
  };

  const handleClosePaymentSuggestion = () => {
    setShowPaymentSuggestion(false);
    closeTrailer();
  };

  const closeTrailer = () => {
    if (trailerTimerRef.current) {
      clearInterval(trailerTimerRef.current);
      trailerTimerRef.current = null;
    }
    setIsTrailerPlaying(false);
    setVideoUrl(null);
    setTrailerTimeRemaining(60);

    if (videoRef.current) {
      if (typeof videoRef.current.pause === 'function') {
        videoRef.current.pause();
      }
      if (videoRef.current.tagName === 'IFRAME') {
        videoRef.current.src = '';
      }
    }
  };

  const handleLike = () => {
    setLiked(liked === true ? null : true);
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleClose = () => {
    if (isPlaying || isTrailerPlaying) {
      setIsPlaying(false);
      setIsTrailerPlaying(false);
      setVideoUrl(null);
      if (trailerTimerRef.current) {
        clearInterval(trailerTimerRef.current);
        trailerTimerRef.current = null;
      }
    } else {
      onclose();
    }
  };

  // Auto-close video when guest's time limit is reached
  useEffect(() => {
    if (hasReachedLimit && isGuest && isPlaying) {
      const timer = setTimeout(() => {
        setIsPlaying(false);
        setVideoUrl(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasReachedLimit, isGuest, isPlaying]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onclose, isPlaying, isTrailerPlaying]);

  if (!movieId) return null;

  const formatRunTime = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const totalSeconds = parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours * 60 + minutes} min`;
    }
    return `${minutes} min`;
  };

  const formatRating = (rating) => {
    if (!rating) return "N/A";
    return (Math.round(rating * 10) / 10).toFixed(1);
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSeries = movie?.contentType === "series";

  const formatExpirationDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  const getPosterUrl = () => {
    if (!movie) return "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
    const poster = movie.poster_path || movie.poster;
    if (!poster) return "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
    return poster.startsWith('http') ? poster : `https://image.tmdb.org/t/p/w500${poster}`;
  };

  return (
    <section>
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt && isGuest && hasReachedLimit}
        onClose={() => setShowAuthPrompt(false)}
        movieTitle={movie?.title || "this movie"}
      />

      {/* Share Options Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Share "{movie?.title || movie?.name || 'Movie'}"
              </h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <span className="text-white text-xl font-bold mb-1">f</span>
                <span className="text-white text-xs">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center justify-center p-4 bg-black hover:bg-gray-900 rounded-lg transition-colors"
              >
                <span className="text-white text-xl mb-1">𝕏</span>
                <span className="text-white text-xs">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <span className="text-white text-xl mb-1">WA</span>
                <span className="text-white text-xs">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleShare('messenger')}
                className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <span className="text-white text-xl mb-1">M</span>
                <span className="text-white text-xs">Messenger</span>
              </button>
              
              <button
                onClick={() => handleShare('telegram')}
                className="flex flex-col items-center justify-center p-4 bg-blue-400 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <span className="text-white text-xl mb-1">TG</span>
                <span className="text-white text-xs">Telegram</span>
              </button>
              
              <button
                onClick={() => handleShare('reddit')}
                className="flex flex-col items-center justify-center p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <span className="text-white text-xl mb-1">R</span>
                <span className="text-white text-xs">Reddit</span>
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="flex flex-col items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Share2 className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs">Copy Link</span>
              </button>
              
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-xs">More</span>
                </button>
              )}
            </div>
            
            <div className="text-center text-neutral-400 text-sm">
              Share with your friends and earn rewards!
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Watch Trailer
              </h3>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
              <img
                src={getPosterUrl()}
                alt={movie?.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <h4 className="text-white font-semibold">{movie?.title || movie?.name}</h4>
                <p className="text-neutral-400 text-sm">
                  {isSeries ? 'Series' : 'Movie'} • {formatRunTime(movie?.videoDuration || movie?.runtime)}
                </p>
              </div>
            </div>
            
            <p className="text-neutral-300 mb-6 text-center">
              Watch a <span className="text-orange-400 font-bold">1-minute preview</span> of the trailer for free
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleWatchTrailer}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-5 h-5" />
                Watch Free Preview
              </button>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-center text-neutral-400 text-sm mt-4">
              After preview, you can choose to purchase the full movie
            </p>
          </div>
        </div>
      )}

      {/* Payment Suggestion Modal */}
      {showPaymentSuggestion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready for the Full Movie?
              </h3>
              <p className="text-neutral-300">
                You've watched the trailer preview. Enjoy the complete story!
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={getPosterUrl()}
                  alt={movie?.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{movie?.title || movie?.name}</h4>
                  <p className="text-neutral-400 text-sm line-clamp-2">
                    {movie?.description?.substring(0, 100)}...
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-neutral-400">
                  <span>Duration:</span>
                  <span className="ml-2 text-white font-medium">
                    {formatRunTime(movie?.videoDuration || movie?.runtime)}
                  </span>
                </div>
                <div className="text-neutral-400">
                  <span>Quality:</span>
                  <span className="ml-2 text-white font-medium">HD</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Price:</span>
                  <span className="text-3xl font-bold text-orange-400">
                    {movie?.currency || 'RWF'} {movie?.viewPrice || movie?.price || "0"}
                  </span>
                </div>
                {movie?.downloadPrice && movie.downloadPrice > 0 && (
                  <p className="text-neutral-400 text-sm mt-2 text-center">
                    + {movie.currency} {movie.downloadPrice} to download
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Purchase Now
              </button>
              
              {!token && (
                <button
                  onClick={() => {
                    setShowPaymentSuggestion(false);
                    navigate('/login', { state: { from: `/movie/${movieId}` } });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Login to Purchase
                </button>
              )}
              
              <button
                onClick={handleClosePaymentSuggestion}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors"
              >
                Continue Browsing
              </button>
              
              <button
                onClick={onclose}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Return to Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-green-400 font-bold">HD</div>
                  <div className="text-neutral-400 text-xs">Quality</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">24/7</div>
                  <div className="text-neutral-400 text-xs">Access</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">Any Device</div>
                  <div className="text-neutral-400 text-xs">Watch Anywhere</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="ml-4 text-neutral-300">Loading details...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-screen flex-col">
            <X className="w-12 h-12 text-red-500" />
            <h2 className="text-2xl font-bold mt-4 text-white">
              Failed to load movie details
            </h2>
            <p className="mt-2 text-neutral-400">Something went wrong.</p>
            <button
              onClick={onclose}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && movie && (
          <>
            {(isPlaying || isTrailerPlaying) && videoUrl ? (
              <div className="relative w-full h-screen bg-black">
                {isTrailerPlaying && (
                  <div className="absolute top-4 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      <span className="font-semibold">Trailer Preview:</span>
                      <span className="text-orange-300 font-bold">
                        {trailerTimeRemaining}s remaining
                      </span>
                    </div>
                  </div>
                )}

                {isGuest && !isTrailerPlaying && (
                  <div className="absolute bottom-4 left-4 z-50 bg-black/70 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <p className="text-white text-sm font-semibold">
                      Guest Preview: {hasReachedLimit ? "Time's up! Please login." : `${timeLeft}s remaining`}
                    </p>
                  </div>
                )}

                {videoUrl.includes('youtube') ? (
                  <iframe
                    ref={videoRef}
                    src={videoUrl}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    autoPlay
                    controls
                    className="w-full h-full"
                    onEnded={() => {
                      if (isTrailerPlaying) {
                        setShowPaymentSuggestion(true);
                      }
                    }}
                  />
                )}

                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Header with close button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                  {/* Left Side - Poster and Rating */}
                  <div className="flex-shrink-0 w-full lg:w-64">
                    {/* Poster */}
                    <div className="relative rounded-lg overflow-hidden shadow-2xl mb-6">
                      <img
                        src={getPosterUrl()}
                        alt={movie.title || movie.name}
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.src = "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                        }}
                      />
                      {isSeries && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
                          {movie.tagline || "Series"}
                        </div>
                      )}
                      {hasAccess && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>ACCESS</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {movie.vote_average && (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-center shadow-lg mb-4">
                        <div className="text-5xl font-bold text-white">
                          {formatRating(movie.vote_average)}
                        </div>
                        <div className="text-white/90 text-sm mt-1">
                          / {movie.vote_count || 0} voted
                        </div>
                        <div className="w-full bg-green-700 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className="bg-green-300 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(parseFloat(movie.vote_average) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Like/Dislike */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                          liked === true
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">Like</span>
                      </button>
                      <button
                        onClick={handleDislike}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                          liked === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-semibold">Dislike</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="flex-1">
                    {/* Title and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        {movie.title || movie.name}
                      </h1>
                      <button 
                        onClick={handleToggleFavorite}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                          isFavorite 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">
                          {isFavorite ? 'Added to favorite' : 'Add to favorite'}
                        </span>
                      </button>
                    </div>

                    {/* Watch Button and Metadata */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <button
                        onClick={handleWatchNow}
                        className="flex items-center cursor-pointer gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-colors shadow-lg"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>{hasAccess ? 'Watch Now' : isSeries ? 'Get Access' : 'Rent Movie'}</span>
                      </button>

                      {
                        // Render share button only if the user is logged in
                        movie.youtubeTrailerLink && movie.youtubeTrailerLink !=null && (
                      <button
                      
                        onClick={handleTrailerButtonClick}
                        className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <Film className="w-5 h-5" />
                        <span>Watch Trailer</span>
                      </button>
                        )
                      }

                      <div className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold">
                        HD
                      </div>

                      {movie.vote_average && (
                        <div className="flex items-center gap-2 text-orange-400 font-semibold">
                          <span>
                            <Star className="w-5 h-5 fill-current" />
                          </span>
                          <span>{formatRating(movie.vote_average)}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                      {movie.description || movie.overview || "No description available."}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 text-white/90">
                      {movie.release_date && (
                        <div>
                          <span className="text-white/60">Released:</span>
                          <span className="ml-2 font-medium">{formatReleaseDate(movie.release_date)}</span>
                        </div>
                      )}
                      {(movie.videoDuration || movie.runtime) && (
                        <div>
                          <span className="text-white/60">Duration:</span>
                          <span className="ml-2 font-medium">
                            {formatRunTime(movie.videoDuration || movie.runtime)}
                          </span>
                        </div>
                      )}
                      {(movie.genres || movie.categories) && (movie.genres?.length > 0 || movie.categories?.length > 0) && (
                        <div>
                          <span className="text-white/60">Genre:</span>
                          <span className="ml-2 font-medium">
                            {(movie.genres || movie.categories)
                              .map(g => g.name || g)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                      {movie.country && (
                        <div>
                          <span className="text-white/60">Country:</span>
                          <span className="ml-2 font-medium">{movie.country}</span>
                        </div>
                      )}
                      {movie.production && (
                        <div className="md:col-span-2">
                          <span className="text-white/60">Production:</span>
                          <span className="ml-2 font-medium">{movie.production}</span>
                        </div>
                      )}
                      {movie.cast && (
                        <div className="md:col-span-2">
                          <span className="text-white/60">Casts:</span>
                          <span className="ml-2 font-medium">{movie.cast}</span>
                        </div>
                      )}
                      {movie.filmmaker && (
                        <div className="md:col-span-2">
                          <span className="text-white/60">Filmmaker:</span>
                          <span className="ml-2 font-medium">{movie.filmmaker.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap gap-3 mb-8">
                      <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-lg cursor-pointer transition-colors">
                       watch {movie.title || movie.name} online
                      </span>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="flex items-center gap-3 mb-8 flex-wrap">
                      <span className="text-white/60 text-sm mr-2">Share:</span>
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>f</span>
                        <span>Share</span>
                      </button>
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>𝕏</span>
                        <span>Tweet</span>
                      </button>
                      <button 
                        onClick={() => handleShare('whatsapp')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => handleShare('messenger')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>Messenger</span>
                      </button>
                      <button 
                        onClick={() => handleShare('reddit')}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>Reddit</span>
                      </button>
                      <button 
                        onClick={() => handleShare('telegram')}
                        className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>Telegram</span>
                      </button>
                      <button 
                        onClick={() => setShowShareOptions(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>More</span>
                      </button>
                    </div>

                    {/* Access Information */}
                    {hasAccess && movie.userAccess && (
                      <div className="mb-8 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="font-semibold">You have access to this content</span>
                        </div>
                        {movie.userAccess.accessType && (
                          <p className="text-green-300 text-sm mt-1">
                            Access type: {movie.userAccess.accessType}
                          </p>
                        )}
                        {movie.userAccess.expiresAt && (
                          <p className="text-green-300 text-sm mt-1">
                            Access expires: {formatExpirationDate(movie.userAccess.expiresAt)}
                          </p>
                        )}
                        {isSeries && episodes.length > 0 && (
                          <p className="text-green-300 text-sm mt-1">
                            You can watch all {episodes.length} episodes
                          </p>
                        )}
                      </div>
                    )}

                    {/* Purchase Button for non-access users */}
                    {!hasAccess && requiresPurchase && (
                      <div className="mb-8">
                        <button
                          onClick={handlePurchase}
                          className="w-full cursor-pointer md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors font-semibold text-lg shadow-lg"
                        >
                          <Play className="w-6 h-6" />
                          {isSeries ? 'Get Series Access' : 'Rent Movie'}
                          <span className="ml-2">
                            ({movie.currency || 'RWF'} {movie.viewPrice})
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Episodes Section - Only show for series */}
                    {isSeries && episodes.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-white text-xl font-semibold">
                              <Tv className="w-6 h-6" />
                              <span>Season {selectedSeason}</span>
                            </div>
                          </div>
                          
                          {seasons.length > 1 && (
                            <select
                              value={selectedSeason}
                              onChange={(e) => setSelectedSeason(Number(e.target.value))}
                              className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {seasons.map(season => (
                                <option key={season.number} value={season.number} className="bg-slate-800">
                                  Season {season.number} ({season.episodeCount} episodes)
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Episodes Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {episodesInSelectedSeason.map((episode) => (
                            <div
                              key={episode.id}
                              onClick={() => handleEpisodeClick(episode)}
                              className="group cursor-pointer"
                            >
                              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-800">
                                <img
                                  src={episode.thumbnail || getPosterUrl()}
                                  alt={episode.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                  </div>
                                </div>
                                {hasAccess && (
                                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Check className="w-3 h-3 inline" />
                                  </div>
                                )}
                              </div>
                              <div className="text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                  <Play className="w-3 h-3" />
                                  <span className="font-medium">Eps {episode.episodeNumber}:</span>
                                </div>
                                <div className="text-white/60 mt-1 line-clamp-1">{episode.title}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {episodesInSelectedSeason.length === 0 && (
                          <div className="text-center py-8 text-neutral-400">
                            No episodes available for this season.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default MovieDetails;