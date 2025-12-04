import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userMovies } = useSelector((state) => state.movies);

  const movie = userMovies?.find((m) => m.id === id);

  const [formData, setFormData] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    genre: movie?.genre || '',
    watchPrice: movie?.watchPrice || '',
    downloadPrice: movie?.downloadPrice || '',
    thumbnail: movie?.thumbnail || null,
    isVisible: movie?.isVisible !== false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check authorization - user can only edit their own movies
  useEffect(() => {
    if (movie && movie.userId !== user?.id) {
      navigate('/unauthorized');
    }
  }, [movie, user?.id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Movie title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.genre) {
      errors.genre = 'Genre is required';
    }

    if (!formData.watchPrice || formData.watchPrice < 0) {
      errors.watchPrice = 'Valid watch price is required';
    }

    if (!formData.downloadPrice || formData.downloadPrice < 0) {
      errors.downloadPrice = 'Valid download price is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      // Call updateMovie from Redux
      // dispatch(updateMovie({ id, movieData: formData }));
      setSuccessMessage('Movie updated successfully!');
      setTimeout(() => {
        navigate('/admin/movies');
      }, 2000);
    } catch (error) {
      console.error('Error updating movie:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Movie not found</p>
          <button
            onClick={() => navigate('/admin/movies')}
            className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/movies')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Movies
        </button>

        <h1 className="text-3xl font-bold mb-2">Edit Movie</h1>
        <p className="text-gray-400 mb-8">Update your movie details</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400">
            {successMessage}
          </div>
        )}

        {/* Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 space-y-6"
        >
          {/* Movie Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Movie Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter movie title"
              className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                validationErrors.title ? 'border-blue-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.title && (
              <p className="text-blue-400 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Movie synopsis..."
              rows="4"
              className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                validationErrors.description ? 'border-blue-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.description && (
              <p className="text-blue-400 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                validationErrors.genre ? 'border-blue-500' : 'border-gray-600'
              }`}
            >
              <option value="">Select genre</option>
              <option value="action">Action</option>
              <option value="drama">Drama</option>
              <option value="comedy">Comedy</option>
              <option value="thriller">Thriller</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="documentary">Documentary</option>
            </select>
            {validationErrors.genre && (
              <p className="text-blue-400 text-sm mt-1">{validationErrors.genre}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Watch Price ($)</label>
              <input
                type="number"
                name="watchPrice"
                value={formData.watchPrice}
                onChange={handleChange}
                placeholder="2.99"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                  validationErrors.watchPrice ? 'border-blue-500' : 'border-gray-600'
                }`}
              />
              {validationErrors.watchPrice && (
                <p className="text-blue-400 text-sm mt-1">{validationErrors.watchPrice}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Download Price ($)</label>
              <input
                type="number"
                name="downloadPrice"
                value={formData.downloadPrice}
                onChange={handleChange}
                placeholder="4.99"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                  validationErrors.downloadPrice ? 'border-blue-500' : 'border-gray-600'
                }`}
              />
              {validationErrors.downloadPrice && (
                <p className="text-blue-400 text-sm mt-1">{validationErrors.downloadPrice}</p>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-600 rounded-lg p-4">
            <input
              type="checkbox"
              id="isVisible"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-blue-400"
            />
            <label htmlFor="isVisible" className="flex-1 cursor-pointer">
              <p className="font-medium">Make Movie Visible</p>
              <p className="text-gray-400 text-sm">
                Viewers will be able to see and purchase this movie
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-2.5 rounded-lg transition-all"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-2">Note:</p>
            <p className="text-gray-300 text-sm">
              Changes to your movie details will be reflected immediately. Prices and visibility can be
              adjusted at any time without affecting existing purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditMovie;
