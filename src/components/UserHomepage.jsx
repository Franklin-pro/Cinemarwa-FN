import React, { useEffect, useState } from 'react'
import { moviesService } from '../services/api/movies'
import MovieSlider from './MovieSlider'
import HeroSection from './HeroSection'
import MovieDetails from './MovieDetails'
import { useMovies } from '../context/MovieContext'
import { normalizeMovies } from './MovieAdapter'

function UserHomepage() {
  const { selectMovieId, closeMovieDetails, openMovieDetails } = useMovies();
  const [allMovies, setAllMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        // Fetch all uploaded movies from backend
        const response = await moviesService.getAllMovies({ limit: 50 });

        // Handle API response structure: response.data.data contains the movies array
        const rawMovies = response.data?.data || response.data || [];

        if (Array.isArray(rawMovies) && rawMovies.length > 0) {
          // Normalize movies to work with existing UI components
          const normalizedMovies = normalizeMovies(rawMovies);
          setAllMovies(normalizedMovies);

          // Set trending movies (sorted by popularity/totalViews)
          const sorted = [...normalizedMovies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          setTrendingMovies(sorted.slice(0, 8));

          // Set featured movies (sorted by rating)
          const featured = [...normalizedMovies].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
          setFeaturedMovies(featured.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="text-white text-lg">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="text-blue-500 text-center">
          <p className="text-lg mb-2">{error}</p>
          <p className="text-sm text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* Trending Section */}
      {trendingMovies.length > 0 && (
        <section id="trending" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
          <MovieSlider
            title="Trending Now"
            subtitle="Most Watched Movies On Our Platform"
            movies={trendingMovies}
          />
        </section>
      )}

      {/* Featured Section */}
      {featuredMovies.length > 0 && (
        <section id="featured" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
          <MovieSlider
            title="Highly Rated"
            subtitle="Top Rated Content From Our Filmmakers"
            movies={featuredMovies}
          />
        </section>
      )}

      {/* All Movies Section */}
      {allMovies.length > 0 && (
        <section id="all-movies" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
          <MovieSlider
            title="All Uploaded Movies"
            subtitle="Browse All Movies Uploaded By Our Community"
            movies={allMovies}
          />
        </section>
      )}

      {/* Empty State */}
      {allMovies.length === 0 && !loading && (
        <section className="bg-gradient-to-b from-neutral-900 to-neutral-950 py-20">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">No Movies Available Yet</h2>
            <p className="text-gray-400">Check back soon for newly uploaded content</p>
          </div>
        </section>
      )}

      {/* Movie Details Modal */}
      {selectMovieId && (
        <MovieDetails movieId={selectMovieId} onclose={closeMovieDetails} />
      )}
    </>
  )
}

export default UserHomepage
