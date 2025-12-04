import { Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useMovies } from '../context/MovieContext'
import { getMoviesByGenre } from '../services/api'

function GenreSection() {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const { genres, loading, openMovieDetails } = useMovies()
  const [genreMovies, setGenreMovies] = useState([])
  const [loadingGenreMovies, setLoadingGenreMovies] = useState(false)

  // Set initial genre when genres load
  useEffect(() => {
    if (!loading && genres.length > 0 && !selectedGenre) {
      setSelectedGenre(genres[0])
    }
  }, [loading, genres, selectedGenre])

  // Load movies when genre changes
  useEffect(() => {
    const loadGenreMovies = async () => {
      if (selectedGenre && selectedGenre.id) {
        setLoadingGenreMovies(true)
        try {
          const movies = await getMoviesByGenre(selectedGenre.id)
          setGenreMovies(movies.slice(0, 8))
        } catch (error) {
          console.error('Error loading genre movies:', error)
          setGenreMovies([])
        } finally {
          setLoadingGenreMovies(false)
        }
      }
    }
    
    loadGenreMovies()
  }, [selectedGenre])

  // Handle movie click
  const handleMovieClick = (movieId) => {
    openMovieDetails(movieId)
  }

  if (loading) {
    return (
      <section className="py-12 bg-neutral-900/50" id="genres">
        <div className="container mx-auto px-4">
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-neutral-900/50" id="genres">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl text-white font-bold mb-6">
          Browse By Genre
        </h2>

        {/* Genre Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {genres.slice(0,10).map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                  selectedGenre?.id === genre.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loadingGenreMovies ? (
          // Loading Spinner
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          // Movies Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {genreMovies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer relative rounded-lg overflow-hidden bg-neutral-800 hover:transform hover:scale-105 transition-all duration-300"
                onClick={() => handleMovieClick(movie.id)}
              >
                {/* Poster */}
                <div className="aspect-[2/3]">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750/333/fff?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x750/333/fff?text=No+Image'
                    }}
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500 text-sm font-medium">
                          {movie.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <span className="text-neutral-200 text-sm font-medium">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                      </span>
                    </div>
                    <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all text-sm">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Movie Title & Info */}
                <div className="p-3">
                  <h3 className="text-white text-sm font-bold truncate mb-1">
                    {movie.title || movie.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-500 text-xs">
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No movies message */}
        {!loadingGenreMovies && genreMovies.length === 0 && selectedGenre && (
          <div className="text-center py-12 text-neutral-400">
            No movies found for {selectedGenre.name} genre.
          </div>
        )}
      </div>
    </section>
  )
}

export default GenreSection