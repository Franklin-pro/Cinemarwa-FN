import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, Loader, Eye, Download } from 'lucide-react';
import { moviesService } from '../../services/api/movies';

function UploadMovie() {
  const navigate = useNavigate();


  const CATEGORIES = ["Action", "Comedy", "Drama", "Horror", "Thriller", "Romance", "Documentary", "Animation", "Sci-Fi", "Fantasy"];

  const [formData, setFormData] = useState({
    title: '',
    original_title: '',
    overview: '',
    release_date: '',
    viewPrice: 0,
    downloadPrice: 0,
    currency: 'RWF',
    royaltyPercentage: 70,
    videoQuality: '720p',
    videoDuration: '',
    allowDownload: true,
    downloadExpiry: 30,
    categories: [],
    tags: '',
    keywords: '',
    language: 'en',
  });

  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.overview.trim() || formData.overview.length < 20) {
      newErrors.overview = 'Overview must be at least 20 characters';
    }
    if (!videoFile) {
      newErrors.videoFile = 'Video file is required';
    } else if (videoFile.size > 5 * 1024 * 1024 * 1024) {
      newErrors.videoFile = 'Video file must be less than 5GB';
    } else if (!videoFile.type.startsWith('video/')) {
      newErrors.videoFile = 'File must be a valid video format';
    }
    if (!posterFile) {
      newErrors.posterFile = 'Poster image is required';
    } else if (!posterFile.type.startsWith('image/')) {
      newErrors.posterFile = 'Poster must be a valid image format';
    }
    if (!backdropFile) {
      newErrors.backdropFile = 'Backdrop image is required';
    } else if (!backdropFile.type.startsWith('image/')) {
      newErrors.backdropFile = 'Backdrop must be a valid image format';
    }
    if (formData.viewPrice < 0) {
      newErrors.viewPrice = 'View price cannot be negative';
    }
    if (formData.downloadPrice < 0) {
      newErrors.downloadPrice = 'Download price cannot be negative';
    }
    if (formData.royaltyPercentage < 0 || formData.royaltyPercentage > 100) {
      newErrors.royaltyPercentage = 'Royalty must be between 0-100%';
    }
    if (formData.categories.length === 0) {
      newErrors.categories = 'Select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Calculate video duration
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.onloadedmetadata = () => {
        setFormData((prev) => ({
          ...prev,
          videoDuration: Math.floor(video.duration),
        }));
        URL.revokeObjectURL(objectUrl);
      };
      setVideoFile(file);
    }
    if (errors.videoFile) {
      setErrors((prev) => ({ ...prev, videoFile: '' }));
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    setPosterFile(file);
    if (errors.posterFile) {
      setErrors((prev) => ({ ...prev, posterFile: '' }));
    }
  };

  const handleBackdropChange = (e) => {
    const file = e.target.files[0];
    setBackdropFile(file);
    if (errors.backdropFile) {
      setErrors((prev) => ({ ...prev, backdropFile: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);
      setSuccessMessage('');

      // Create FormData for multipart upload
      const uploadFormData = new FormData();

      // Add all movie details
      uploadFormData.append('title', formData.title);
      uploadFormData.append('original_title', formData.original_title || formData.title);
      uploadFormData.append('overview', formData.overview);
      uploadFormData.append('release_date', formData.release_date || new Date().toISOString().split('T')[0]);
      
      // NEW: Separate pricing for viewing and downloading
      uploadFormData.append('viewPrice', formData.viewPrice);
      uploadFormData.append('downloadPrice', formData.downloadPrice);
      
      uploadFormData.append('currency', formData.currency);
      uploadFormData.append('royaltyPercentage', formData.royaltyPercentage);
      uploadFormData.append('videoQuality', formData.videoQuality);
      uploadFormData.append('videoDuration', formData.videoDuration);
      uploadFormData.append('allowDownload', formData.allowDownload);
      uploadFormData.append('downloadExpiry', formData.downloadExpiry);
      uploadFormData.append('language', formData.language);

      // Add categories
      uploadFormData.append('categories', formData.categories.join(','));

      // Add tags and keywords
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('keywords', formData.keywords);

      // Add FILES
      uploadFormData.append('posterFile', posterFile);
      uploadFormData.append('backdropFile', backdropFile);
      uploadFormData.append('videoFile', videoFile);

      // Upload using the service with progress tracking
      const response = await moviesService.uploadMovie(uploadFormData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      if (response.status !== 201) {
        throw new Error(response.data.message || 'Failed to upload movie');
      }

      setSuccessMessage('Movie uploaded successfully! Awaiting admin approval.');
      setTimeout(() => {
        navigate('/dashboard/filmmaker');
      }, 2000);
    } catch (error) {
      console.error('❌ Upload Error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to upload movie. Please try again.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Movie</h1>
          <p className="text-gray-400">Share your film with the world. Your movie will be reviewed before publishing.</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 space-y-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-300">{errors.submit}</p>
            </div>
          )}

          {/* Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title <span className="text-blue-400">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Movie title"
                className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                  errors.title ? 'border-blue-500' : 'border-gray-600'
                }`}
              />
              {errors.title && <p className="text-blue-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Original Title</label>
              <input
                type="text"
                name="original_title"
                value={formData.original_title}
                onChange={handleChange}
                placeholder="Original title"
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium mb-2">Overview/Synopsis <span className="text-blue-400">*</span></label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              placeholder="Detailed movie synopsis (min 20 characters)"
              rows="4"
              className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                errors.overview ? 'border-blue-500' : 'border-gray-600'
              }`}
            />
            {errors.overview && <p className="text-blue-400 text-xs mt-1">{errors.overview}</p>}
          </div>

          {/* Release Date and Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Release Date</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="en"
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Image Files */}
          <div className="grid grid-cols-2 gap-4">
            {/* Poster Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Poster Image <span className="text-blue-400">*</span></label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                errors.posterFile ? 'border-blue-500 bg-blue-500/5' : 'border-gray-600 hover:border-blue-400'
              }`}>
                <input
                  type="file"
                  onChange={handlePosterChange}
                  accept="image/*"
                  className="hidden"
                  id="poster-upload"
                />
                <label htmlFor="poster-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">
                    {posterFile ? posterFile.name : 'Click to upload poster'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, WebP (max 10MB)</p>
                </label>
              </div>
              {errors.posterFile && <p className="text-blue-400 text-xs mt-1">{errors.posterFile}</p>}
            </div>

            {/* Backdrop Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Backdrop Image <span className="text-blue-400">*</span></label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                errors.backdropFile ? 'border-blue-500 bg-blue-500/5' : 'border-gray-600 hover:border-blue-400'
              }`}>
                <input
                  type="file"
                  onChange={handleBackdropChange}
                  accept="image/*"
                  className="hidden"
                  id="backdrop-upload"
                />
                <label htmlFor="backdrop-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">
                    {backdropFile ? backdropFile.name : 'Click to upload backdrop'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, WebP (max 10MB)</p>
                </label>
              </div>
              {errors.backdropFile && <p className="text-blue-400 text-xs mt-1">{errors.backdropFile}</p>}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-3">Categories <span className="text-blue-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 accent-blue-400"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
            {errors.categories && <p className="text-blue-400 text-xs mt-1">{errors.categories}</p>}
          </div>

          {/* Tags and Keywords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Comma separated tags"
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Keywords</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="Comma separated keywords"
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Pricing Section - UPDATED WITH SEPARATE VIEW/DOWNLOAD PRICING */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💰 Pricing & Monetization
            </h3>
            
            {/* Currency Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
              >
                <option value="RWF">RWF ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="XOF">XOF (CFA)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* View Price */}
              <div>
                <label className=" text-sm font-medium mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  View/Stream Price
                </label>
                <input
                  type="number"
                  name="viewPrice"
                  value={formData.viewPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                    errors.viewPrice ? 'border-blue-500' : 'border-gray-600'
                  }`}
                />
                <p className="text-gray-400 text-xs mt-1">Price to watch online (0 = free)</p>
                {errors.viewPrice && <p className="text-blue-400 text-xs mt-1">{errors.viewPrice}</p>}
              </div>

              {/* Download Price */}
              <div>
                <label className="
                 text-sm font-medium mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-400" />
                  Download Price
                </label>
                <input
                  type="number"
                  name="downloadPrice"
                  value={formData.downloadPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                    errors.downloadPrice ? 'border-blue-500' : 'border-gray-600'
                  }`}
                />
                <p className="text-gray-400 text-xs mt-1">Price to download (0 = free)</p>
                {errors.downloadPrice && <p className="text-blue-400 text-xs mt-1">{errors.downloadPrice}</p>}
              </div>

              {/* Royalty Percentage */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Royalty %</label>
                <input
                  type="number"
                  name="royaltyPercentage"
                  value={formData.royaltyPercentage}
                  onChange={handleChange}
                  placeholder="70"
                  step="1"
                  min="0"
                  max="100"
                  className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none focus:border-blue-400 ${
                    errors.royaltyPercentage ? 'border-blue-500' : 'border-gray-600'
                  }`}
                />
                <p className="text-gray-400 text-xs mt-1">Your share of revenue</p>
                {errors.royaltyPercentage && <p className="text-blue-400 text-xs mt-1">{errors.royaltyPercentage}</p>}
              </div>
            </div>

            {/* Pricing Info Card */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>💡 Pricing Strategy:</strong> You can set different prices for viewing and downloading. 
                For example: Free to watch (viewPrice = 0) but charge for downloads, or charge for viewing and offer free downloads to purchasers.
              </p>
            </div>
          </div>

          {/* Video Settings */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Video Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Quality</label>
                <select
                  name="videoQuality"
                  value={formData.videoQuality}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
                >
                  <option value="240p">240p</option>
                  <option value="360p">360p</option>
                  <option value="480p">480p</option>
                  <option value="720p">720p (Recommended)</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Allow Download</label>
                <label className="flex items-center gap-2 p-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    name="allowDownload"
                    checked={formData.allowDownload}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-400"
                  />
                  <span className="text-sm">Enable Downloads</span>
                </label>
              </div>
            </div>
            {formData.allowDownload && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Download Expiry (Days)</label>
                <input
                  type="number"
                  name="downloadExpiry"
                  value={formData.downloadExpiry}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400"
                />
                <p className="text-gray-400 text-xs mt-1">How long download links remain valid after purchase</p>
              </div>
            )}
          </div>

          {/* Video File Upload */}
          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium mb-2">Movie Video File <span className="text-blue-400">*</span></label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              errors.videoFile ? 'border-blue-500 bg-blue-500/5' : 'border-gray-600 hover:border-blue-400'
            }`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300">
                  {videoFile ? videoFile.name : 'Click to upload or drag and drop'}
                </p>
                {videoFile && (
                  <>
                    <p className="text-gray-400 text-xs mt-1">
                      Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {formData.videoDuration > 0 && (
                      <p className="text-gray-400 text-xs">
                        Duration: {Math.floor(formData.videoDuration / 60)}:{(formData.videoDuration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </>
                )}
                <p className="text-gray-400 text-sm mt-2">MP4, WebM, or OGG (max 5GB)</p>
              </label>
            </div>
            {errors.videoFile && <p className="text-blue-400 text-xs mt-1">{errors.videoFile}</p>}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-semibold">Important</p>
              <p className="text-sm text-blue-300 mt-1">
                Make sure you have the rights to distribute this content. Your film will be reviewed by our team before publishing. Processing may take 24-48 hours.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading Movie...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Movie
              </>
            )}
          </button>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">Upload Progress</p>
                <p className="text-sm font-semibold text-blue-400">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {uploadProgress === 100
                  ? 'Finalizing upload... Please wait for confirmation.'
                  : `Uploading your movie... ${uploadProgress}% complete`}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UploadMovie;