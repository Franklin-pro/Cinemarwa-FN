import { PlayCircle, PlusCircle, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useMovies } from "../context/MovieContext";


function HeroSection() {
  const { nowPlayingMovies, loading } = useMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
    const {openMovieDetails} = useMovies();

  const featureTrendingMovies = nowPlayingMovies.slice(0, 5);

    const handleMovieClick = (movieId)=>{
    openMovieDetails(movieId);
  }

  useEffect(() => {
    if (loading || featureTrendingMovies.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % featureTrendingMovies.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, featureTrendingMovies.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-lg">Loading movies...</span>
      </div>
    );
  }

  if (!loading && featureTrendingMovies.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
        <p>No trending movies available.</p>
      </div>
    );
  }

  const activeMovie = featureTrendingMovies[currentSlide];


  return (
    <div className="relative w-full h-screen">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${activeMovie.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-neutral-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/30" />
      </div>

      <div className="absolute inset-0 flex items-center z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          <div
            key={activeMovie.id}
            className={`transition-all duration-700 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
            onTransitionEnd={() => setIsTransitioning(false)}
          >
            <div className="flex items-center flex-wrap space-x-3 mb-4 text-sm">
              <span className="bg-blue-500/90 text-white font-semibold px-2 py-0.5 rounded-sm">
                NOW PLAYING MOVIE
              </span>
              <div className="flex items-center text-neutral-300">
                <Star className="w-4 h-4 text-blue-500 mr-1" />
                <span>{activeMovie.vote_average?.toFixed(1) ?? "N/A"}</span>
              </div>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-300">
                {activeMovie.release_date || "Unknown"}
              </span>
              <span className="text-neutral-400">•</span>
              <span
                className={`${
                  activeMovie.adult ? "bg-blue-500/80" : "bg-green-500/80"
                } text-white text-xs px-2 py-0.5 rounded`}
              >
                {activeMovie.adult ? "18+" : "PG"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {activeMovie.title || activeMovie.name}
            </h1>

            <p className="text-neutral-300 text-base md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl">
              {activeMovie.overview}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleMovieClick(activeMovie.id)}
                className="bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                <PlayCircle />
                Watch Now
              </button>
{/* 
              <button className="bg-neutral-800/80 px-4 py-2 hover:bg-neutral-800 text-white rounded-lg flex items-center gap-2 transition-all">
                <PlusCircle />
                Add to Watchlist
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-0 left-0 flex justify-center gap-2 z-10">
        {featureTrendingMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 w-2 rounded-full transition-all ${
              currentSlide === idx ? "bg-blue-600 w-4" : "bg-neutral-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;