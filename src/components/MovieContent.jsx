import React from 'react'
import HeroSection from './HeroSection'
import MovieSlider from './MovieSlider'
import GenreSection from './GenreSection'
import MovieDetails from './MovieDetails'
import { useMovies } from '../context/MovieContext'

function MovieContent() {
  const { topRatedMovies,upcomingMovies,latestMovies,trendingweekly, popularMovies, selectMovieId, closeMovieDetails, error } = useMovies();

  if (error) return <div className='text-white text-center py-8'>{error}</div>

  return (
    <>
      {/* Home Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* Info Banner for Guest Users */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 border-t border-b border-blue-500/30 py-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white text-sm md:text-base">
            🎬 Enjoy free trailers & previews •
            <a href="/register" className="text-blue-400 font-semibold ml-2 hover:underline">Sign up or log in to access unlimited movies from our creators</a>
          </p>
        </div>
      </section>

      {/* Trending Section */}
      <section id="trending" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <MovieSlider
          title="Trending This Week"
          subtitle="Free Trailers - Stay Updated with What's everyone's watching"
          movies={trendingweekly}
        />
      </section>
        <section id="Latest Movies" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <MovieSlider
          title="Latest Movies"
          subtitle="Latest Movies From TMDB"
          movies={latestMovies}
        />
      </section>
           <section id="upcoming" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <MovieSlider
          title="Upcoming Movies"
          subtitle="Upcoming Releases Coming Soon"
          movies={upcomingMovies}
        />
      </section>

      {/* Popular Section */}
      <section id="popular" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <MovieSlider
          title="Popular"
          subtitle="Popular Movies on TMDB"
          movies={popularMovies}
        />
      </section>

      {/* Genre Section */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <GenreSection />
      </section>

      {/* Top Rated Section */}
      <section id="topRated" className="bg-gradient-to-b from-neutral-900 to-neutral-950">
        <MovieSlider
          title="Top Rated"
          subtitle="Top Rated Movies of All Time"
          movies={topRatedMovies}
        />
      </section>


      {/* Movie Details Modal */}
      {selectMovieId && (
        <MovieDetails movieId={selectMovieId} onclose={closeMovieDetails} />
      )}
    </>
  )
}

export default MovieContent