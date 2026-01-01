import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addReview } from '../store/slices/movieSlice';
import { Star } from 'lucide-react';

function ReviewForm({ movieId, onReviewAdded }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.movies);

  const [formData, setFormData] = useState({
    review: '',
    content: '',
    rating: 5,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      rating: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.review.trim()) {
      setError('Review review is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Review content is required');
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    try {
      // Add the review
      const reviewResult = await dispatch(
        addReview({
          movieId,
          reviewData: {
            review: formData.review,
            content: formData.content,
            rating: formData.rating,
          },
        })
      ).unwrap();

      setSuccess('Review added successfully!');
      setFormData({ review: '', content: '', rating: 5 });

      if (onReviewAdded) {
        onReviewAdded(reviewResult);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err || 'Failed to add review');
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="text-gray-300">Please log in to add a review</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Add a Review</h3>

      {error && (
        <div className="bg-blue-900/20 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRatingChange(value)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={`${
                    value <= (hoveredRating || formData.rating)
                      ? 'fill-blue-400 text-blue-400'
                      : 'text-gray-500'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {formData.rating} out of 5 stars
          </p>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review Title
          </label>
          <input
            type="text"
            name="review"
            value={formData.review}
            onChange={handleInputChange}
            placeholder="What's the main point?"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.review.length}/100 characters
          </p>
        </div>

        {/* Review Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Review
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Share your thoughts about this movie..."
            rows={5}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.content.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            loading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-black cursor-pointer'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;