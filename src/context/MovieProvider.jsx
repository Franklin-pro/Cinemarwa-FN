import React, { useEffect, useState } from "react";
import {
  getGenres,
  getLatestMovies,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getTrendingWeekMovies,
  getUpcomingMovies,
  getBackendUpcomingMovies,
  getBackendTrendingMovies,
  getBackendTopRatedMovies,
  getBackendFeaturedMovies,
  getBackendPopularMovies,
  getBackendRecentMovies
} from "../services/api";
import { MovieContext } from "./MovieContext";

// Helper function to merge and prioritize backend movies first
const mergeMovies = (backendMovies, tmdbMovies, limit = 20) => {
  const combined = [...(backendMovies || []), ...(tmdbMovies || [])];
  return combined.slice(0, limit);
};

// Helper function to extract movies from backend response
const extractBackendMovies = (response) => {
  if (!response) return [];
  if (response.data && response.data.movies) {
    return response.data.movies;
  }
  return [];
};

export const MovieProvider = ({ children }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [trendingweekly, setTrendingWeekly] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectMovieId, setSelectMovieId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          tmdbTrending,
          tmdbTopRated,
          tmdbPopular,
          genresData,
          tmdbNowPlaying,
          tmdbUpcoming,
          tmdbLatest,
          tmdbTrendingweek,
          backendUpcomingResp,
          backendTrendingResp,
          backendTopRatedResp,
          backendFeaturedResp,
          backendPopularResp,
          backendRecentResp
        ] = await Promise.all([
          getTrendingMovies(),
          getTopRatedMovies(),
          getPopularMovies(),
          getGenres(),
          getNowPlayingMovies(),
          getUpcomingMovies(),
          getLatestMovies(),
          getTrendingWeekMovies(),
          getBackendUpcomingMovies().catch(() => ({ data: { movies: [] } })),
          getBackendTrendingMovies().catch(() => ({ data: { movies: [] } })),
          getBackendTopRatedMovies().catch(() => ({ data: { movies: [] } })),
          getBackendFeaturedMovies().catch(() => ({ data: { movies: [] } })),
          getBackendPopularMovies().catch(() => ({ data: { movies: [] } })),
          getBackendRecentMovies().catch(() => ({ data: { movies: [] } }))
        ]);

        // Extract movies from backend responses
        const backendUpcoming = extractBackendMovies(backendUpcomingResp);
        const backendTrending = extractBackendMovies(backendTrendingResp);
        const backendTopRated = extractBackendMovies(backendTopRatedResp);
        const backendFeatured = extractBackendMovies(backendFeaturedResp);
        const backendPopular = extractBackendMovies(backendPopularResp);
        const backendRecent = extractBackendMovies(backendRecentResp);

        // Set state with merged data
        setTrendingMovies(mergeMovies(backendTrending, tmdbTrending));
        setTopRatedMovies(mergeMovies(backendTopRated, tmdbTopRated));
        setPopularMovies(mergeMovies(backendPopular, tmdbPopular));
        setGenres(genresData);
        setNowPlayingMovies(tmdbNowPlaying);
        setUpcomingMovies(mergeMovies(backendUpcoming, tmdbUpcoming));
        setLatestMovies(mergeMovies(backendRecent, tmdbLatest));
        setTrendingWeekly(mergeMovies(backendFeatured, tmdbTrendingweek));
        
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(err.message || "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openMovieDetails = (movieId) => {
    setSelectMovieId(movieId);
    document.body.style.overflow = "hidden";
  };

  const closeMovieDetails = () => {
    setSelectMovieId(null);
    document.body.style.overflow = "auto";
  };

  return (
    <MovieContext.Provider
      value={{
        trendingMovies,
        topRatedMovies,
        popularMovies,
        genres,
        upcomingMovies,
        nowPlayingMovies,
        trendingweekly,
        latestMovies,
        loading,
        error,
        selectMovieId,
        openMovieDetails,
        closeMovieDetails,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};