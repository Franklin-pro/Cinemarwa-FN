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
        const [
          tmdbTrending,
          tmdbTopRated,
          tmdbPopular,
          genresData,
          tmdbNowPlaying,
          tmdbUpcoming,
          tmdbLatest,
          tmdbTrendingweek,
          backendUpcoming,
          backendTrending,
          backendTopRated,
          backendFeatured,
          backendPopular,
          backendRecent
        ] = await Promise.all([
          getTrendingMovies(),
          getTopRatedMovies(),
          getPopularMovies(),
          getGenres(),
          getNowPlayingMovies(),
          getUpcomingMovies(),
          getLatestMovies(),
          getTrendingWeekMovies(),
          getBackendUpcomingMovies().catch(() => []),
          getBackendTrendingMovies().catch(() => []),
          getBackendTopRatedMovies().catch(() => []),
          getBackendFeaturedMovies().catch(() => []),
          getBackendPopularMovies().catch(() => []),
          getBackendRecentMovies().catch(() => [])
        ]);

        // Merge backend movies with TMDB movies (backend first for priority)
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
        setError(err);
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
