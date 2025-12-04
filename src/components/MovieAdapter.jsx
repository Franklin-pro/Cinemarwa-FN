/**
 * Movie Adapter - Normalizes movie objects from different sources
 * Converts backend movie format to component-compatible format
 */

export function normalizeMovie(movie) {
  if (!movie) return null;

  return {
    id: movie.id,
    title: movie.title || movie.original_title,
    overview: movie.overview,

    // Poster / Backdrop (backend uses full URLs)
    poster_path: movie.poster_path || movie.poster || null,
    backdrop_path: movie.backdrop_path || movie.backdrop || null,

    // Backend categories are strings → convert to genre objects
    genres: movie.categories
      ? movie.categories.map((c, index) => ({ id: index + 1, name: c }))
      : movie.genres || [],

    // Release date
    release_date: movie.release_date,

    // Rating (convert backend string to number)
    avgRating: movie.avgRating ? Number(movie.avgRating) : null,
    vote_count: movie.vote_count || null,

    // Prices
    viewPrice: movie.viewPrice,
    downloadPrice: movie.downloadPrice,
    currency: movie.currency,

    // Video
    videoUrl: movie.videoUrl || movie.streamingUrl || null,
    allowDownload: movie.allowDownload,

    // Filmmaker data
    filmmaker: movie.filmmakerName
      ? {
          name: movie.filmmakerName,
          bio: movie.filmmakerBio,
          image: movie.filmmakerProfileImage
        }
      : null,
  };
}


export const normalizeMovies = (movies) => {
  if (!Array.isArray(movies)) {
    return [];
  }
  return movies.map(normalizeMovie);
};
