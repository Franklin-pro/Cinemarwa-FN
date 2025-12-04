import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieReviews } from '../store/slices/movieSlice';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

function ReviewList({ movieId }) {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector((state) => state.movies);
  const movieReviews = reviews[movieId] || [];

  useEffect(() => {
    if (movieId) {
      dispatch(getMovieReviews(movieId));
    }
  }, [movieId, dispatch]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!movieReviews || movieReviews.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-6">
        Reviews ({movieReviews.length})
      </h3>

      {movieReviews.map((review) => (
        <div key={review.id} className="bg-gray-800 rounded-lg p-6">
          {/* Reviewer Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {review.userAvatar && (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-white">{review.userName}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < review.avgRating
                          ? 'fill-blue-400 text-blue-400'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-300 font-semibold">
                  {review.rating}/5
                </span>
              </div>
            </div>
          </div>

          {/* Review Title and Content */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">
              {review.title}
            </h4>
            <p className="text-gray-300 leading-relaxed">{review.content}</p>
          </div>

          {/* Review Footer */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <ThumbsUp size={16} />
              <span className="text-sm">Helpful</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <MessageSquare size={16} />
              <span className="text-sm">Reply</span>
            </button>
          </div>

          {/* Helpful Count */}
          {review.helpfulCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {review.helpfulCount} found this helpful
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReviewList;