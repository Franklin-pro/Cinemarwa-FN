const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

export const getTrendingMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies day:", error);
    return [];
  }
};
export const getTrendingWeekMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies week:", error);
    return [];
  }
};

export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const getMoviesByGenre = async (genreId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=1`
    );
    const data = await response.json();

    // Always return an array
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return [];
  }
};


export const getGenres = async () => {
  try {
     const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};
export const getLatestMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/latest?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};
export const getNowPlayingMovies = async ()=>{
 try {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

export const getUpcomingMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

/**
 * Search movies from backend database
 * @param {string} query - Search query string
 * @returns {Promise<Array>} Array of movies from backend database
 */
export const searchBackendMovies = async (query) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/movies/search?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    // Handle both response formats
    return data.data || data.results || [];
  } catch (error) {
    console.error("Error searching backend movies:", error);
    return [];
  }
};

export const getMovieImages = async (path, size = 'original') => {
    if(!path)
        return "https://via.placeholder.com/400x600?text=No+image+Available";
        return `https://image.tmdb.org/t/p/${size}${path}`;
};

// ===== BACKEND MOVIES API =====
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetch backend movies with sorting options
 * @param {string} sortBy - 'upcoming', 'trending', 'top-rated', 'featured', 'popular', 'recent'
 * @param {number} page - Page number for pagination
 * @param {number} limit - Items per page
 * @returns {Promise<Array>} Array of movies
 */
export const getBackendMovies = async (sortBy = 'upcoming', page = 1, limit = 20) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/movies?sortBy=${sortBy}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${sortBy} movies:`, error);
    return [];
  }
};

/**
 * Fetch upcoming backend movies
 */
export const getBackendUpcomingMovies = async () => {
  return getBackendMovies('upcoming', 1, 20);
};

/**
 * Fetch trending backend movies
 */
export const getBackendTrendingMovies = async () => {
  return getBackendMovies('trending', 1, 20);
};

/**
 * Fetch top-rated backend movies
 */
export const getBackendTopRatedMovies = async () => {
  return getBackendMovies('top-rated', 1, 20);
};

/**
 * Fetch featured backend movies
 */
export const getBackendFeaturedMovies = async () => {
  return getBackendMovies('featured', 1, 20);
};

/**
 * Fetch popular backend movies
 */
export const getBackendPopularMovies = async () => {
  return getBackendMovies('popular', 1, 20);
};

/**
 * Fetch recent backend movies
 */
export const getBackendRecentMovies = async () => {
  return getBackendMovies('recent', 1, 20);
};

export const getMovieVideos = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();

    // Ensure it's always an array
    return Array.isArray(data.results) ? data.results : [];
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

export const getSeriesVideos = async (seriesId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${seriesId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching series videos:", error);
    return [];
  }
};


// export const getMovieCblueits = async (movieId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/movie/${movieId}/cblueits?api_key=${API_KEY}&language=en-US`
//     );
//     const data = await response.json();
//     return data.cast;
//   } catch (error) {
//     console.error("Error fetching movie cblueits:", error);
//     return [];
//   }
// };

// export const getMovieReviews = async (movieId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&language=en-US&page=1`
//     );
//     const data = await response.json();
//     return data.results;
//   } catch (error) {
//     console.error("Error fetching movie reviews:", error);
//     return [];
//   }
// };

// export const getSimilarMovies = async (movieId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
//     );
//     const data = await response.json();
//     return data.results;
//   } catch (error) {
//     console.error("Error fetching similar movies:", error);
//     return [];
//   }
// };
