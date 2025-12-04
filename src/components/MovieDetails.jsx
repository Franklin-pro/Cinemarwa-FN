import { Play, X, Star, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMovieDetails, getMovieVideos } from "../services/api";
import { moviesService } from "../services/api/movies";
import { normalizeMovie } from "./MovieAdapter";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthPromptModal from "./AuthPromptModal";
import { useGuestVideoTimer } from "../hooks/useGuestVideoTimer";

function MovieDetails({ movieId, onclose }) {
  const { token } = useSelector((state) => state.auth);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const navigate = useNavigate();

  // Guest user timer - shows modal after 10 seconds of watching
  const isGuest = !token;
  const { timeLeft, hasReachedLimit } = useGuestVideoTimer(
    isGuest,
    isPlaying,
    () => setShowAuthPrompt(true)
  );

  useEffect(() => {
    if (!movieId) return;
    
    async function getMovieDetail() {
      try {
        setLoading(true);
        let movieData = null;

        // Check if it's a backend movie (UUID or MongoDB ID) or TMDB movie (numeric ID)
        // UUID format: 8-4-4-4-12 hex digits (e.g., 57423afe-0c58-43d1-89db-0e35d4f66080)
        // MongoDB ObjectId: 24 hex characters
        // TMDB ID: numeric only
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(movieId);
        const isMongoId = /^[a-f0-9]{24}$/.test(movieId);
        const isTmdbId = /^\d+$/.test(movieId);
        const isBackendMovie = isUuid || isMongoId;

        if (isBackendMovie) {
          // Try to fetch from backend API (for backend movies with UUID or MongoDB ID)
          try {
            console.log(`🎬 Fetching backend movie with ID: ${movieId} (${isUuid ? 'UUID' : 'MongoDB'})`);
            const response = await moviesService.getMovie(movieId);
          
            movieData = response.data.data;
            console.log(`✅ Backend movie found:`, movieData || 'Unknown');
          } catch (err) {
            console.error("❌ Backend API error for movie ID:", movieId, err.message);
            setError(true);
            return;
          }
        } else if (isTmdbId) {
          console.log(`🎬 Fetching TMDB movie with ID: ${movieId}`);
          movieData = await getMovieDetails(movieId);
          console.log(`✅ TMDB movie found:`, movieData?.title || 'Unknown');
        } else {
          console.error("❌ Invalid movieId format:", movieId);
          setError(true);
          return;
        }

        setMovie(movieData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    getMovieDetail();
  }, [movieId, token]);

  const handleWatchNow = async () => {
    try {
      // If it's a backend movie with direct video URL, use it
      if (movie?.videoUrl) {
        setVideoUrl(movie.videoUrl);
        setIsPlaying(true);
      } else {
        // Check if this is a backend movie (UUID/MongoDB) or TMDB movie
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(movieId);
        const isMongoId = /^[a-f0-9]{24}$/.test(movieId);
        const isTmdbId = /^\d+$/.test(movieId);
        
        if (isUuid || isMongoId) {
          // For backend movies without videoUrl, try to get trailer from metadata
          if (movie?.trailerUrl) {
            setVideoUrl(movie.trailerUrl);
            setIsPlaying(true);
          } else {
            alert("Trailer not available for this movie.");
          }
        } else if (isTmdbId) {
          // For TMDB movies, fetch YouTube trailer
          const videos = await getMovieVideos(movieId);
          const trailer = videos.find(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          );
          if (trailer) {
            setVideoUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
            setIsPlaying(true);
          } else {
            alert("Trailer not available.");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch video:", error);
      alert("Failed to load video.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onclose();
    }
  };

  const handleDownloadClick = () => {
    if (!token) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    navigate(`/payment/${movieId}?type=download`);
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
      // Close the video player after a short delay to show the modal
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
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h : ${minutes}m : ${secs}s` : `${hours}h`;
    } 
    if (minutes > 0) {
      return secs > 0 ? `${minutes}m : ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
  };

  const formatRating = (rating) => {
    if (!rating) return "N/A";
    return (Math.round(rating * 10) / 10).toFixed(1);
  };

  return (
    <section>
      {/* Auth Prompt Modal for Guest Users */}
      <AuthPromptModal
        isOpen={showAuthPrompt && isGuest && hasReachedLimit}
        onClose={() => setShowAuthPrompt(false)}
        movieTitle={movie?.title || "this movie"}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/95 backdrop-blur-sm overflow-auto"
        onClick={handleBackdropClick}
      >
        <div className="relative w-full max-w-5xl bg-neutral-800 rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="ml-4 text-neutral-300">Loading details...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96 flex-col">
              <X className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold mt-4 text-white">
                Failed to load movie details
              </h2>
              <p className="mt-2 text-neutral-400">Something went wrong.</p>
              <button
                onClick={onclose}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && movie && (
            <>
              {/* Fullscreen video mode */}
              {isPlaying && videoUrl ? (
                <div className="relative w-full h-[80vh] md:h-[90vh] bg-black">
                  <iframe
                    src={videoUrl}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>

                  {/* Guest User Timer Warning */}
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
                /* Normal movie details mode */
                <>
                  <div className="relative h-72 md:h-96 w-full">
                    {movie.backdrop_path || movie.backdrop ? (
                      <img
                        src={
                          // If it's a full URL (backend), use directly
                          (movie.backdrop_path || movie.backdrop)?.startsWith('http')
                            ? (movie.backdrop_path || movie.backdrop)
                            // If it's TMDB path, add TMDB domain
                            : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-800 via-neutral-800/60 to-transparent" />
                    
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 -mt-32 md:-mt-48 relative">
                      <div className="w-32 md:w-64 flex-shrink-0 mb-4 md:mb-0 mx-auto md:mx-0">
                        <div className="rounded-lg overflow-hidden shadow-lg border border-neutral-700">
                          {movie.poster_path || movie.poster ? (
                            <img
                              src={
                                // If it's a full URL (backend), use directly
                                (movie.poster_path || movie.poster)?.startsWith('http')
                                  ? (movie.poster_path || movie.poster)
                                  // If it's TMDB path, add TMDB domain
                                  : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                              }
                              alt={movie.title}
                              className="w-full h-auto"
                              onError={(e) => {
                                e.target.src = "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                              }}
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-neutral-700 flex items-center justify-center text-neutral-400">
                              No Poster Available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-white text-center md:text-left">
                          {movie.title || movie.name}
                          {movie.release_date && (
                            <span className="text-neutral-400 font-normal ml-2">
                              ({movie.release_date.split("-")[0]})
                            </span>
                          )}
                        </h1>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center md:justify-start">
                          {movie.avgRating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-blue-500" />
                              <span className="text-blue-500 text-sm font-medium ml-1">
                                {formatRating(movie.avgRating)}
                                {movie.vote_count && (
                                  <span className="text-neutral-400 ml-1">
                                    ({movie.vote_count.toLocaleString()} votes)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {movie.videoDuration && (
                            <span className="text-neutral-300">
                              {formatRunTime(movie.videoDuration || movie.runtime)}
                            </span>
                          )}
                          {movie.release_date && (
                            <span className="text-neutral-300">
                              {movie.release_date}
                            </span>
                          )}
                          {movie.adult && (
                            <span className="bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded">
                              18+
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                          {(movie.genres || movie.categories || []).map((g, idx) => (
                            <span
                              key={g.id || idx}
                              className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-xs"
                            >
                              {g.name || g}
                            </span>
                          ))}
                        </div>

                        {movie.tagline && (
                          <p className="text-neutral-400 mt-4 italic text-center md:text-left">
                            {movie.tagline}
                          </p>
                        )}

                        <div className="mt-6">
                          <h2 className="text-xl font-semibold text-white mb-2 text-center md:text-left">
                            Overview
                          </h2>
                          <p className="text-neutral-300 text-center md:text-left">
                            {movie.overview || "No overview available."}
                          </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start items-center">
                          <button
                            onClick={handleWatchNow}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Play className="w-5 h-5" />
                            Watch Now
                            {movie.viewPrice && <span className="ml-2 text-sm">({movie.currency || 'RWF'} {movie.viewPrice})</span>}
                          </button>

                          {movie.allowDownload && movie.downloadPrice && (
                            <button
                              onClick={handleDownloadClick}
                              className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                              title="Download this movie"
                            >
                              <Download className="w-5 h-5" />
                              Download
                              <span className="text-sm">({movie.currency || 'RWF'} {movie.downloadPrice})</span>
                            </button>
                          )}

                          {movie.filmmaker && (
                            <div className="w-full mt-4 p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-neutral-300">
                                <span className="font-semibold text-white">Filmmaker:</span> {movie.filmmaker.name}
                              </p>
                              {movie.filmmaker.bio && (
                                <p className="text-sm text-neutral-400 mt-2">{movie.filmmaker.bio}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MovieDetails;