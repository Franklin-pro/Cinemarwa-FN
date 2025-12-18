import { Play, X, Star, Tv, Film, Calendar, Check, ThumbsUp, ThumbsDown, Plus, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMovieDetails, getMovieVideos } from "../services/api";
import { moviesService } from "../services/api/movies";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthPromptModal from "./AuthPromptModal";
import { useGuestVideoTimer } from "../hooks/useGuestVideoTimer";

function MovieDetails({ movieId, onclose }) {
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
  const [liked, setLiked] = useState(null); // null, true (liked), or false (disliked)
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

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

        // Check if it's a backend movie (UUID or MongoDB ID) or TMDB movie (numeric ID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(movieId);
        const isMongoId = /^[a-f0-9]{24}$/.test(movieId);
        const isTmdbId = /^\d+$/.test(movieId);
        const isBackendMovie = isUuid || isMongoId;

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
        return; // 👈 Skip guest 60-second logic
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
      } else if (movie?.trailerUrl) {
        setVideoUrl(movie.trailerUrl);
        setIsPlaying(true);
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
    navigate(`/payment/${movieId}?type=${isSeries ? 'series_access' : 'watch'}`);
  };

  const handleLike = () => {
    setLiked(liked === true ? null : true);
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In real app: call API to add/remove from favorites
  };

  const handleClose = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setVideoUrl(null);
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
  }, [onclose, isPlaying]);

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
        day: 'numeric' 
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

  const getBackdropUrl = () => {
    if (!movie) return null;
    const backdrop = movie.backdrop_path || movie.backdrop;
    if (!backdrop) return null;
    return backdrop.startsWith('http') ? backdrop : `https://image.tmdb.org/t/p/w1280${backdrop}`;
  };

  return (
    <section>
      <AuthPromptModal
        isOpen={showAuthPrompt && isGuest && hasReachedLimit}
        onClose={() => setShowAuthPrompt(false)}
        movieTitle={movie?.title || "this movie"}
      />

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
            {isPlaying && videoUrl ? (
              <div className="relative w-full h-screen bg-black">
                <iframe
                  src={videoUrl}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>

                {isGuest && (
                  <div className="absolute bottom-4 left-4 z-50 bg-black/70 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <p className="text-white text-sm font-semibold">
                      Guest Preview: {hasReachedLimit ? "Time's up! Please login." : `${timeLeft}s remaining`}
                    </p>
                  </div>
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
                    {movie.avgRating && (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-center shadow-lg mb-4">
                        <div className="text-5xl font-bold text-white">
                          {formatRating(movie.avgRating)}
                        </div>
                        <div className="text-white/90 text-sm mt-1">
                          / {movie.vote_count || 0} voted
                        </div>
                        <div className="w-full bg-green-700 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className="bg-green-300 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(parseFloat(movie.avgRating) / 10) * 100}%` }}
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
                        className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-colors shadow-lg"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Watch now</span>
                      </button>

                      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg">
                        <Film className="w-5 h-5" />
                        <span>Trailer</span>
                      </div>

                      <div className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold">
                        HD
                      </div>

                      {movie.avgRating && (
                        <div className="flex items-center gap-2 text-orange-400 font-semibold">
                          <span>IMDb:</span>
                          <span>{formatRating(movie.avgRating)}</span>
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
                        {movie.title || movie.name} Online Free
                      </span>
                      <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-lg cursor-pointer transition-colors">
                        Where to watch {movie.title || movie.name}
                      </span>
                      <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-lg cursor-pointer transition-colors">
                        {movie.title || movie.name} movie free online
                      </span>
                      <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-lg cursor-pointer transition-colors">
                        {movie.title || movie.name} free online
                      </span>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="flex items-center gap-3 mb-8 flex-wrap">
                      <span className="text-white/60 text-sm mr-2">Share:</span>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                        <span>f</span>
                        <span>13</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-sm transition-colors">
                        <span>𝕏</span>
                        <span>26</span>
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                        <span>WhatsApp</span>
                      </button>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                        <span>Messenger</span>
                      </button>
                      <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors">
                        <span>Reddit</span>
                      </button>
                      <button className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
                        <span>Telegram</span>
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
                          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors font-semibold text-lg shadow-lg"
                        >
                          <Play className="w-6 h-6" />
                          {isSeries ? 'Get Series Access' : 'Rent Movie'}
                          <span className="ml-2">
                            ({movie.currency || 'RWF'} {movie.viewPrice})
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Episodes Section */}
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