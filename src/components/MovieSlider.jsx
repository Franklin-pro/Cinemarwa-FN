import {
  ChevronLeft,
  ChevronRight,
  Star,
  Film,
  Tv,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useMovies } from "../context/MovieContext";

function MovieSlider({ title, subtitle = "", movies }) {

  const sliderRef = useRef(null);
  const { openMovieDetails } = useMovies();
  const [hoveredMovieId, setHoveredMovieId] = useState(null);

  const handleMovieClick = (movieId) => {
    openMovieDetails(movieId);
    if (hoveredMovieId) {
      setHoveredMovieId(null);
    }
  };

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Helper function to safely format ratings
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return "N/A";
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (typeof num !== 'number' || isNaN(num)) return "N/A";
    return num.toFixed(1);
  };

  // Format year from date
  const getYear = (dateString) => {
    if (!dateString) return "TBA";
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return "TBA";
    }
  };

  // Get content type icon and label - IMPROVED VERSION
  const getContentTypeInfo = (movie) => {
    // First, check if contentType is directly on the movie object
    const contentType = movie.contentType || movie.content_type || movie.type;
    
    if (contentType) {
      const type = contentType.toString().toLowerCase().trim();
      switch (type) {
        case 'series':
          return { 
            icon: <Tv className="w-3 h-3 text-white" />, 
            label: "Series", 
            color: "bg-green-500/75" 
          };
        case 'movie':
          return { 
            icon: <Film className="w-3 h-3 text-white" />, 
            label: "Movie", 
            color: "bg-blue-600" 
          };
      }
    }
    
    // If no contentType, try to infer from other properties
    // Check if it's from backend by URL patterns or other properties
    const posterUrl = movie.poster_path || movie.poster;
    // const backdropUrl = movie.backdrop_path || movie.backdrop;
    
    // Method 1: Check URL path for hints
    if (posterUrl) {
      if (posterUrl.includes('/series/')) {
        return { 
          icon: <Tv className="w-3 h-3 text-blue-500" />, 
          label: "Series", 
          color: "bg-blue-600" 
        };
      }
      if (posterUrl.includes('/movies/')) {
        return { 
          icon: <Film className="w-3 h-3 text-blue-500" />, 
          label: "Movie", 
          color: "bg-blue-600" 
        };
      }
    }
    
    // Method 2: Check if it has videoUrl (more likely a movie)
    if (movie.videoUrl) {
      return { 
        icon: <Film className="w-3 h-3 text-blue-500" />, 
        label: "Movie", 
        color: "bg-blue-600" 
      };
    }
    
    // Method 3: Check view price (series often have higher view prices)
    // This is a heuristic - adjust based on your business logic
    if (movie.viewPrice > 50) { // If view price is high, might be series
      return { 
        icon: <Tv className="w-3 h-3 text-blue-500" />, 
        label: "Series", 
        color: "bg-blue-600" 
      };
    }
    
    // Default to Movie if we can't determine
    console.warn('Could not determine content type for movie:', movie.id, movie.title);
    return { 
      icon: <Film className="w-3 h-3 text-gray-500" />, 
      label: "Unknown", 
      color: "bg-gray-600" 
    };
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start md:items-baseline mb-4 md:mb-8 gap-4">
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
            <h2>{title}</h2>
            {subtitle && (
              <p className="text-neutral-400 text-xs md:text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex space-x-1 md:space-x-2 flex-shrink-0">
            <button
              onClick={() => scroll("left")}
              className="bg-neutral-800/70 hover:bg-neutral-700 rounded-full p-1 md:p-2 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="text-white w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="bg-neutral-800/70 hover:bg-neutral-700 rounded-full p-1 md:p-2 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="text-white w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Movie Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex space-x-3 md:space-x-4 lg:space-x-5 overflow-x-auto scrollbar-hide pb-2 md:pb-4 snap-x scroll-smooth"
          >
            {movies.map((movie) => {
              // Pass the entire movie object to getContentTypeInfo
              const contentTypeInfo = getContentTypeInfo(movie);
              
              return (
                <div
                  key={movie.id}
                  onMouseEnter={() => setHoveredMovieId(movie.id)}
                  onMouseLeave={() => setHoveredMovieId(null)}
                  onClick={() => handleMovieClick(movie.id)}
                  className="flex-shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] group cursor-pointer"
                >
                  {/* Movie Card Container */}
                  <div className="bg-neutral-800 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-black/50">
                    
                    {/* Fixed Aspect Ratio Image Container */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                      <img
                        src={
                          movie.poster?.startsWith('http')
                            ? movie.poster
                            : movie.poster_path?.startsWith('http')
                            ? movie.poster_path
                            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        }
                        alt={movie.title || movie.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                          e.target.className = "absolute inset-0 w-full h-full object-contain bg-neutral-900 p-2";
                        }}
                      />
                      
                      {/* Content Type Badge - Top Left */}
                      <div className={`absolute top-2 left-2 ${contentTypeInfo.color} text-white text-xs font-bold px-2 py-1 flex items-center gap-1`}>
                        {contentTypeInfo.icon}
                        <span>{contentTypeInfo.label}</span>
                      </div>
                      
                      {/* Top Right Corner Badge for Rating */}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-white text-xs font-bold">
                          {formatRating(movie.vote_average || movie.avgRating)}
                        </span>
                      </div>

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-500 fill-blue-500" />
                              <span className="text-blue-500 text-xs md:text-sm font-bold">
                                {formatRating(movie.vote_average || movie.avgRating)}
                              </span>
                            </div>
                            <span className="text-neutral-300 text-xs">
                              {getYear(movie.release_date)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovieClick(movie.id);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md font-medium text-xs md:text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Movie Title and Info - Fixed Height */}
                    <div className="p-3 min-h-[80px] flex flex-col justify-between">
                      <h3 className="text-white text-sm md:text-base font-semibold line-clamp-2 leading-tight mb-2">
                        {movie.title || movie.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span>{getYear(movie.release_date)}</span>
                          <div className="flex items-center gap-1">
                            {contentTypeInfo.icon}
                            <span className="text-xs">{contentTypeInfo.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-blue-500" />
                          <span className="font-medium">
                            {formatRating(movie.vote_average || movie.avgRating)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MovieSlider;