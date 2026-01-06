// frontend/components/UploadMovie.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Upload, 
  CheckCircle, 
  Loader, 
  Eye, 
  Download, 
  ChevronDown,
  Film,
  Tv,
  Calendar,
  Globe,
  DollarSign,
  Tag,
  AlertCircle,
  X,
  Image,
  Video,
  Info
} from 'lucide-react';
import { 
  uploadMovie, 
  getFilmmakerSeries,
  clearUploadState
} from '../../store/slices/movieSlice';

// Categories for selection
const CATEGORIES = [
  "Action", "Comedy", "Drama", "Horror", "Thriller", 
  "Romance", "Documentary", "Animation", "Sci-Fi", "Fantasy",
  "Adventure", "Crime", "Mystery", "Family", "Musical"
];

// Video quality options
const VIDEO_QUALITIES = [
  { value: '240p', label: '240p (Low)' },
  { value: '360p', label: '360p (Medium)' },
  { value: '480p', label: '480p (Standard)' },
  { value: '720p', label: '720p (HD - Recommended)' },
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '4K', label: '4K (Ultra HD)' }
];

// Currency options
const CURRENCIES = [
    { value: 'RWF', symbol: 'FRw', label: 'RWF (FRw)' },
  // { value: 'USD', symbol: '$', label: 'USD ($)' },
  // { value: 'EUR', symbol: '€', label: 'EUR (€)' },
  // { value: 'GHS', symbol: '₵', label: 'GHS (₵)' },
  // { value: 'XOF', symbol: 'CFA', label: 'XOF (CFA)' },
  // { value: 'NGN', symbol: '₦', label: 'NGN (₦)' }
];

// Age restrictions
const AGE_RESTRICTIONS = [
  { value: 0, label: 'All Ages' },
  { value: 7, label: '7+' },
  { value: 13, label: '13+' },
  { value: 16, label: '16+' },
  { value: 18, label: '18+ (Adults Only)' }
];

function UploadMovie() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Select state from Redux
  const { 
    uploadLoading, 
    uploadProgress, 
    uploadSuccess, 
    uploadError,
    filmmakerSeries,
    seriesLoading 
  } = useSelector((state) => state.movies);

  const fileInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const backdropInputRef = useRef(null);

  // State for form data
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    release_date: '',
    language: 'en',
    original_language: 'en',
    youtubeTrailerLink: '',
    
    // Content Type
    contentType: 'movie',
    seriesId: '',
    seasonNumber: '',
    episodeNumber: '',
    episodeTitle: '',
    totalSeasons: 1,
    
    // Categories & Tags
    categories: [],
    tags: '',
    ageRestriction: 0,
    
    // Pricing - DEFAULT VIEW PRICE SET TO 100
    viewPrice: 100,
    downloadPrice: 0,
    currency: 'RWF',
    royaltyPercentage: 70,
    allowDownload: true,
    downloadExpiry: 30,
    
    // Video Settings
    videoQuality: '720p',
    videoDuration: 0,
    
    // Features
    isFeatured: false,
    isTrending: false,
  });

  // State for files
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  
  // Local state
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [videoDuration, setVideoDuration] = useState(0);
  const [errors, setErrors] = useState({});

  // Get filmmaker ID from localStorage
  const getFilmmakerId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id || 'current-user-id';
  };

  // Fetch filmmaker's series when component loads or content type changes
  useEffect(() => {
    if (formData.contentType === 'episode') {
      const filmmakerId = getFilmmakerId();
      dispatch(getFilmmakerSeries(filmmakerId));
    }
  }, [dispatch, formData.contentType]);

  // Reset upload state on component mount
  useEffect(() => {
    dispatch(clearUploadState());
  }, [dispatch]);

  // Handle successful upload
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        resetForm();
        navigate('/dashboard/filmmaker');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, navigate]);

  // Calculate video duration when file is selected
  const calculateVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      
      video.src = objectUrl;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const duration = Math.floor(video.duration);
        setVideoDuration(duration);
        setFormData(prev => ({ ...prev, videoDuration: duration }));
        resolve(duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
    });
  };

  // Handle file selection
  const handleFileChange = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = {
      video: 5 * 1024 * 1024 * 1024, // 5GB
      image: 10 * 1024 * 1024, // 10MB
    };

    // Validate file size
    if (fileType === 'video' && file.size > maxSize.video) {
      setErrors(prev => ({ ...prev, videoFile: 'Video file must be less than 5GB' }));
      return;
    }

    if ((fileType === 'poster' || fileType === 'backdrop') && file.size > maxSize.image) {
      setErrors(prev => ({ ...prev, [fileType]: 'Image must be less than 10MB' }));
      return;
    }

    // Validate file type
    if (fileType === 'video' && !file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, videoFile: 'Please select a valid video file' }));
      return;
    }

    if ((fileType === 'poster' || fileType === 'backdrop') && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [fileType]: 'Please select a valid image file' }));
      return;
    }

    // Clear any previous errors
    setErrors(prev => ({ ...prev, [fileType]: '', videoFile: '' }));

    // Set the file
    switch (fileType) {
      case 'video':
        setVideoFile(file);
        await calculateVideoDuration(file);
        break;
      case 'poster':
        setPosterFile(file);
        break;
      case 'backdrop':
        setBackdropFile(file);
        break;
    }
  };

  // Handle series selection
  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setFormData(prev => ({
      ...prev,
      seriesId: series.id,
      seriesTitle: series.title,
      viewPrice: 0, // Episode price is 0
      downloadPrice: 0
    }));
    setShowSeriesDropdown(false);
    setErrors(prev => ({ ...prev, seriesId: '' }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : 
              value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      
      if (errors.categories) {
        setErrors(prev => ({ ...prev, categories: '' }));
      }
      
      return { ...prev, categories: newCategories };
    });
  };

  // Format time from seconds
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim() || formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    // Description validation
    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // YouTube trailer link validation (optional)
    if (formData.youtubeTrailerLink && formData.youtubeTrailerLink.trim()) {
      const yt = formData.youtubeTrailerLink.trim();
      const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&.*)?$/;
      if (!ytRegex.test(yt)) {
        newErrors.youtubeTrailerLink = 'Please enter a valid YouTube link';
      }
    }

    // Series validation for episodes
    if (formData.contentType === 'episode') {
      if (!formData.seriesId) {
        newErrors.seriesId = 'Please select a series';
      }
      if (!formData.seasonNumber || formData.seasonNumber < 1) {
        newErrors.seasonNumber = 'Enter a valid season number';
      }
      if (!formData.episodeNumber || formData.episodeNumber < 1) {
        newErrors.episodeNumber = 'Enter a valid episode number';
      }
    }

    // File validations
    if (formData.contentType === 'movie' && !videoFile) {
      newErrors.videoFile = 'Video file is required for movies';
    }
    
    if (formData.contentType === 'episode' && !videoFile) {
      newErrors.videoFile = 'Video file is required for episodes';
    }
    
    if (videoFile && videoFile.size > 5 * 1024 * 1024 * 1024) {
      newErrors.videoFile = 'Video file must be less than 5GB';
    }
    
    if (videoFile && !videoFile.type.startsWith('video/')) {
      newErrors.videoFile = 'Please select a valid video file';
    }
    
    // Poster is required for all content types
    if (!posterFile) {
      newErrors.posterFile = 'Poster image is required';
    }
    
    // Backdrop is required for all content types
    if (!backdropFile) {
      newErrors.backdropFile = 'Backdrop image is required';
    }

    // Categories validation (not required for episodes as they inherit from series)
    if (formData.contentType !== 'episode' && formData.categories.length === 0) {
      newErrors.categories = 'Select at least one category';
    }

    // Pricing validation - DIFFERENT FOR CONTENT TYPES
    const isMovie = formData.contentType === 'movie';
    const isSeries = formData.contentType === 'series';
    
    if (isMovie) {
      if (formData.viewPrice < 100) {
        newErrors.viewPrice = 'View price must be at least 100 RWF';
      }
      
      if (formData.downloadPrice < 0) {
        newErrors.downloadPrice = 'Download price cannot be negative';
      }
    }
    
    if (isSeries) {
      if (formData.viewPrice < 100) {
        newErrors.viewPrice = 'Series price must be at least 100 RWF';
      }
    }
    
    // Episodes don't need price validation (price is 0)
    
    if (formData.royaltyPercentage < 0 || formData.royaltyPercentage > 100) {
      newErrors.royaltyPercentage = 'Royalty must be between 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }

    try {
      // Create FormData for all content types
      const formDataToSend = new FormData();

      const isMovie = formData.contentType === 'movie';
      const isSeries = formData.contentType === 'series';
      const isEpisode = formData.contentType === 'episode';

      // Append basic info
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('overview', formData.description);
      formDataToSend.append('original_title', formData.title);
      formDataToSend.append('release_date', formData.release_date);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('original_language', formData.original_language);
      formDataToSend.append('contentType', formData.contentType);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('royaltyPercentage', formData.royaltyPercentage);
      formDataToSend.append('videoQuality', formData.videoQuality);
      formDataToSend.append('videoDuration', formData.videoDuration);
      formDataToSend.append('ageRestriction', formData.ageRestriction);
      formDataToSend.append('youtubeTrailerLink', formData.youtubeTrailerLink);

      // Handle content type specific fields
      if (isMovie) {
        // Movie pricing
        formDataToSend.append('viewPrice', formData.viewPrice);
        formDataToSend.append('downloadPrice', formData.downloadPrice);
        formDataToSend.append('allowDownload', formData.allowDownload);
        formDataToSend.append('downloadExpiry', formData.downloadExpiry);
        formDataToSend.append('price', formData.viewPrice);
        
        // Movie features
        formDataToSend.append('isFeatured', formData.isFeatured);
        formDataToSend.append('isTrending', formData.isTrending);
        
        // Movie tags
        if (formData.tags) {
          const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
          formDataToSend.append('keywords', JSON.stringify(tagsArray));
        }
      }
      
      if (isSeries) {
        // Series pricing (series price)
        formDataToSend.append('viewPrice', formData.viewPrice);
        formDataToSend.append('downloadPrice', 0); // Series don't have downloads
        formDataToSend.append('price', formData.viewPrice);
        formDataToSend.append('totalSeasons', formData.totalSeasons);
        
        // Default release schedule for series
        formDataToSend.append('releaseSchedule', JSON.stringify({
          pattern: "weekly",
          dayOfWeek: 0,
          time: "20:00",
          interval: 7
        }));
      }
      
      if (isEpisode) {
        // Episode info
        formDataToSend.append('seriesId', formData.seriesId);
        formDataToSend.append('seasonNumber', formData.seasonNumber);
        formDataToSend.append('episodeNumber', formData.episodeNumber);
        if (formData.episodeTitle) {
          formDataToSend.append('episodeTitle', formData.episodeTitle);
        }
        
        // Episode pricing is 0 (users buy the series)
        formDataToSend.append('viewPrice', 0);
        formDataToSend.append('downloadPrice', 0);
        formDataToSend.append('price', 0);
        
        // Episodes inherit series features, so no individual features
      }

      // Append categories (not for episodes - they inherit from series)
      if (!isEpisode && formData.categories.length > 0) {
        formDataToSend.append('categories', JSON.stringify(formData.categories));
      }

      // Append files
      if (videoFile && (isMovie || isEpisode)) formDataToSend.append('videoFile', videoFile);
      if (posterFile) formDataToSend.append('posterFile', posterFile);
      if (backdropFile) formDataToSend.append('backdropFile', backdropFile);
      
      // Dispatch upload action
      await dispatch(uploadMovie(formDataToSend)).unwrap();
      
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      release_date: '',
      language: 'en',
      original_language: 'en',
      contentType: 'movie',
      seriesId: '',
      seasonNumber: '',
      episodeNumber: '',
      episodeTitle: '',
      totalSeasons: 1,
      categories: [],
      tags: '',
      youtubeTrailerLink: '',
      ageRestriction: 0,
      viewPrice: 100, // Changed from 0 to 100
      downloadPrice: 0,
      currency: 'RWF',
      royaltyPercentage: 70,
      allowDownload: true,
      downloadExpiry: 30,
      videoQuality: '720p',
      videoDuration: 0,
      isFeatured: false,
      isTrending: false,
    });
    
    setVideoFile(null);
    setPosterFile(null);
    setBackdropFile(null);
    setSelectedSeries(null);
    setErrors({});
    setActiveStep(1);
    setVideoDuration(0);
    dispatch(clearUploadState());
  };

  // Steps for multi-step form
  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Content Details' },
    { id: 3, name: 'Pricing' },
    { id: 4, name: 'Upload Files' }
  ];

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Content Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Content Type</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                contentType: 'movie',
                seriesId: '',
                seasonNumber: '',
                episodeNumber: '',
                viewPrice: 100, // Changed from 0 to 100
                downloadPrice: 0
              }));
              setSelectedSeries(null);
              setVideoFile(null);
              setErrors(prev => ({ ...prev, videoFile: '' }));
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.contentType === 'movie' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Film className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Movie</span>
            <p className="text-xs text-gray-400 mt-1">Single video content</p>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                contentType: 'series',
                seriesId: '',
                seasonNumber: '',
                episodeNumber: '',
                viewPrice: 100, // Changed from 10 to 100
                downloadPrice: 0
              }));
              setSelectedSeries(null);
              setVideoFile(null);
              setErrors(prev => ({ ...prev, videoFile: '' }));
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.contentType === 'series' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Tv className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Series</span>
            <p className="text-xs text-gray-400 mt-1">Collection of episodes</p>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                contentType: 'episode',
                viewPrice: 0, // Episode price is 0
                downloadPrice: 0
              }));
              setVideoFile(null);
              setErrors(prev => ({ ...prev, videoFile: '' }));
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.contentType === 'episode' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Film className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Episode</span>
            <p className="text-xs text-gray-400 mt-1">Part of a series</p>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {formData.contentType === 'episode' ? 'Episode Title' : 'Title'} *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder={formData.contentType === 'episode' ? "Enter episode title" : "Enter title"}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.title && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your content in detail (minimum 20 characters)"
          rows="4"
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
        )}
        <p className="text-gray-400 text-xs mt-1">
          {formData.description.length}/20 characters minimum
        </p>
      </div>

      {/* Series Selection for Episodes */}
      {formData.contentType === 'episode' && (
        <div>
          <label className="block text-sm font-medium mb-2">Select Series *</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSeriesDropdown(!showSeriesDropdown)}
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg flex items-center justify-between ${
                errors.seriesId ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <span className="text-gray-300">
                {selectedSeries ? selectedSeries.title : 'Select a series...'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showSeriesDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSeriesDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {seriesLoading ? (
                  <div className="p-4 text-center">
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 mt-2">Loading series...</p>
                  </div>
                ) : !filmmakerSeries || filmmakerSeries.length === 0 ? (
                  <div className="p-4">
                    <p className="text-gray-400 mb-3">No series found.</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contentType: 'series' }))}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      + Create New Series
                    </button>
                  </div>
                ) : (
                  filmmakerSeries.map((series) => (
                    <button
                      key={series.id}
                      type="button"
                      onClick={() => handleSeriesSelect(series)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
                    >
                      <div className="font-medium">{series.title}</div>
                      <div className="text-sm text-gray-400">
                        {series.totalEpisodes || 0} episodes • Season {series.totalSeasons || 1}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.seriesId && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.seriesId}
            </p>
          )}
        </div>
      )}

      {/* Season and Episode for Episodes */}
      {formData.contentType === 'episode' && selectedSeries && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Season Number *</label>
            <input
              type="number"
              name="seasonNumber"
              value={formData.seasonNumber}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.seasonNumber ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.seasonNumber && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.seasonNumber}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Episode Number *</label>
            <input
              type="number"
              name="episodeNumber"
              value={formData.episodeNumber}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.episodeNumber ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.episodeNumber && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.episodeNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Total Seasons for Series */}
      {formData.contentType === 'series' && (
        <div>
          <label className="block text-sm font-medium mb-2">Total Seasons</label>
          <input
            type="number"
            name="totalSeasons"
            value={formData.totalSeasons}
            onChange={handleInputChange}
            placeholder="1"
            min="1"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 text-xs mt-1">You can add more seasons later</p>
        </div>
      )}

      {/* Episode Title for Episodes */}
      {formData.contentType === 'episode' && (
        <div>
          <label className="block text-sm font-medium mb-2">Episode Title (Optional)</label>
          <input
            type="text"
            name="episodeTitle"
            value={formData.episodeTitle}
            onChange={handleInputChange}
            placeholder="e.g., 'The Beginning', 'Final Showdown'"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );

  // Step 2: Content Details
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Release Date and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Release Date
          </label>
          <input
            type="date"
            name="release_date"
            value={formData.release_date}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Language
          </label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            placeholder="en"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 text-xs mt-1">ISO language code</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Original Language
          </label>
          <input
            type="text"
            name="original_language"
            value={formData.original_language}
            onChange={handleInputChange}
            placeholder="en"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories - Not required for episodes (they inherit from series) */}
      {formData.contentType !== 'episode' && (
        <div>
          <label className="block text-sm font-medium mb-3">
            Categories *
            {errors.categories && (
              <span className="text-red-400 text-sm ml-2">{errors.categories}</span>
            )}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  formData.categories.includes(category)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Selected: {formData.categories.length} categories
          </p>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <Tag className="w-4 h-4 inline mr-2" />
          Tags
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="action, drama, thriller, adventure (comma separated)"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-gray-400 text-xs mt-1">Helps users discover your content</p>
      </div>

      {/* YouTube Trailer Link (Optional) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <Video className="w-4 h-4 inline mr-2" />
          YouTube Trailer (optional)
        </label>
        <input
          type="url"
          name="youtubeTrailerLink"
          value={formData.youtubeTrailerLink}
          onChange={handleInputChange}
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.youtubeTrailerLink ? 'border-red-500' : 'border-gray-700'}`}
        />
        {errors.youtubeTrailerLink && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.youtubeTrailerLink}
          </p>
        )}
        <p className="text-gray-400 text-xs mt-1">Paste a YouTube link to show a trailer on your content page</p>
      </div>

      {/* Age Restriction */}
      <div>
        <label className="block text-sm font-medium mb-2">Age Restriction</label>
        <select
          name="ageRestriction"
          value={formData.ageRestriction}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          {AGE_RESTRICTIONS.map((age) => (
            <option key={age.value} value={age.value}>
              {age.label}
            </option>
          ))}
        </select>
      </div>

      {/* Video Quality - Only for movies and episodes */}
      {formData.contentType !== 'series' && (
        <div>
          <label className="block text-sm font-medium mb-2">Video Quality</label>
          <select
            name="videoQuality"
            value={formData.videoQuality}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            {VIDEO_QUALITIES.map((quality) => (
              <option key={quality.value} value={quality.value}>
                {quality.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Features - Only for movies */}
      {formData.contentType === 'movie' && (
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800/30 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-500 bg-gray-800 border-gray-700 rounded"
            />
            <div>
              <span className="font-medium">Featured</span>
              <p className="text-xs text-gray-400">Highlight on homepage</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800/30 cursor-pointer">
            <input
              type="checkbox"
              name="isTrending"
              checked={formData.isTrending}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-500 bg-gray-800 border-gray-700 rounded"
            />
            <div>
              <span className="font-medium">Trending</span>
              <p className="text-xs text-gray-400">Show in trending section</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );

  // Step 3: Pricing
  const renderStep3 = () => {
    const isMovie = formData.contentType === 'movie';
    const isSeries = formData.contentType === 'series';
    const isEpisode = formData.contentType === 'episode';
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Information
          </h3>
          <p className="text-gray-400 text-sm">
            {isMovie && "Set pricing for your movie. Minimum price is 100 RWF."}
            {isSeries && "Set the series price. Minimum price is 100 RWF. Users purchase the series to access all episodes."}
            {isEpisode && (
              <span className="text-blue-400">
                ⓘ Episode pricing is inherited from the series. Users purchase the series to access all episodes.
              </span>
            )}
          </p>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            disabled
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Price - Required for Movies and Series, Not for Episodes */}
        {(isMovie || isSeries) && (
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {isMovie ? 'Movie View Price *' : 'Series Price *'}
              <span className="text-xs font-normal text-gray-400">
                {isMovie ? '(Minimum price: 100 RWF)' : '(Minimum price: 100 RWF - Price to purchase entire series)'}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {'RWF'}
              </span>
              <input
                type="number"
                name="viewPrice"
                value={formData.viewPrice}
                onChange={handleInputChange}
                placeholder="100"
                step="1"
                min="100"
                className={`w-full pl-15 pr-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.viewPrice ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
            {errors.viewPrice && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.viewPrice}
              </p>
            )}
            {isSeries && (
              <p className="text-blue-400 text-xs mt-1">
                Users who purchase this series will have access to all episodes.
                Minimum price: 100 RWF
              </p>
            )}
          </div>
        )}

        {/* Episode Pricing Info - Show informational message */}
        {isEpisode && (
          <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300">Episode Pricing</h4>
                <p className="text-sm text-blue-400/80 mt-1">
                  This episode is part of the series "{selectedSeries?.title || 'Selected Series'}".
                  Users purchase the series to access all episodes. Episode pricing is managed at the series level.
                </p>
                {selectedSeries && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded">
                    <p className="text-xs text-gray-300">
                      Series Price: {CURRENCIES.find(c => c.value === formData.currency)?.symbol || '$'}
                      {selectedSeries.viewPrice || 100}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Download Settings - Only for Movies */}
        {isMovie && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800/30 cursor-pointer">
              <input
                type="checkbox"
                name="allowDownload"
                checked={formData.allowDownload}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-500 bg-gray-800 border-gray-700 rounded"
              />
              <div>
                <span className="font-medium">Allow Downloads</span>
                <p className="text-xs text-gray-400">Users can download for offline viewing</p>
              </div>
            </label>

            {formData.allowDownload && (
              <>
                {/* Download Price */}
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Price
                    <span className="text-xs font-normal text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {CURRENCIES.find(c => c.value === formData.currency)?.symbol || '$'}
                    </span>
                    <input
                      type="number"
                      name="downloadPrice"
                      value={formData.downloadPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.downloadPrice ? 'border-red-500' : 'border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.downloadPrice && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.downloadPrice}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    Set to 0 if downloads are free with purchase
                  </p>
                </div>

                {/* Download Expiry */}
                <div>
                  <label className="block text-sm font-medium mb-2">Download Expiry (Days)</label>
                  <input
                    type="number"
                    name="downloadExpiry"
                    value={formData.downloadExpiry}
                    onChange={handleInputChange}
                    placeholder="30"
                    min="1"
                    max="365"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    How long download links remain valid after purchase
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Royalty Percentage */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Royalty Percentage</label>
          <div className="relative">
            <input
              type="number"
              name="royaltyPercentage"
              value={formData.royaltyPercentage}
              onChange={handleInputChange}
              placeholder="70"
              step="1"
              min="0"
              max="100"
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.royaltyPercentage ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              %
            </span>
          </div>
          {errors.royaltyPercentage && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.royaltyPercentage}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            Your share of revenue from each purchase
          </p>
        </div>

        {/* Series Pricing Model Explanation */}
        {(isSeries || isEpisode) && (
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium mb-2 text-blue-300">Series Pricing Model</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Users purchase the <span className="text-blue-400">entire series</span>, not individual episodes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>One-time purchase grants access to <span className="text-blue-400">all current and future episodes</span></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Episodes are automatically added to users' libraries as they're released</span>
              </li>
              {isEpisode && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>This episode will be <span className="text-green-400">free</span> for users who own the series</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Step 4: Upload Files
  const renderStep4 = () => {
    const isMovie = formData.contentType === 'movie';
    const isSeries = formData.contentType === 'series';
    const isEpisode = formData.contentType === 'episode';
    
    return (
      <div className="space-y-6">
        {/* Video File Upload (for movies and episodes, not for series) */}
        {(isMovie || isEpisode) && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Video File *
              {errors.videoFile && (
                <span className="text-red-400 text-sm ml-2">{errors.videoFile}</span>
              )}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                errors.videoFile 
                  ? 'border-red-500 bg-red-500/5' 
                  : videoFile
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileChange(e, 'video')}
                accept="video/*"
                className="hidden"
              />
              
              {videoFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Video className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(videoFile.size)} • {formatTime(videoDuration)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setVideoDuration(0);
                      setFormData(prev => ({ ...prev, videoDuration: 0 }));
                    }}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-medium">Click to upload video</p>
                  <p className="text-gray-400 text-sm mt-2">
                    MP4, WebM, or OGG (max 5GB)
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Supported formats: MP4, WebM, OGG, AVI, MOV
                  </p>
                </div>
              )}
            </div>
            {(isMovie || isEpisode) && !videoFile && !errors.videoFile && (
              <p className="text-yellow-400 text-sm mt-2">
                Video file is required for {isMovie ? 'movies' : 'episodes'}
              </p>
            )}
          </div>
        )}

        {/* Series Video Info */}
        {isSeries && (
          <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300">Series Upload Information</h4>
                <p className="text-sm text-blue-400/80 mt-1">
                  Series don't require a video file. You'll upload episodes separately.
                  Just add the poster and backdrop images to create your series page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Poster Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Poster Image *
            {errors.posterFile && (
              <span className="text-red-400 text-sm ml-2">{errors.posterFile}</span>
            )}
          </label>
          <div
            onClick={() => posterInputRef.current?.click()}
            className={`border-3 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              errors.posterFile 
                ? 'border-red-500 bg-red-500/5' 
                : posterFile
                ? 'border-green-500 bg-green-500/5'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              ref={posterInputRef}
              type="file"
              onChange={(e) => handleFileChange(e, 'poster')}
              accept="image/*"
              className="hidden"
            />
            
            {posterFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Image className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{posterFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(posterFile.size)}
                  </p>
                </div>
                {posterFile && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(posterFile)}
                      alt="Poster preview"
                      className="h-40 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-xs text-gray-400 mt-2">Preview</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPosterFile(null);
                  }}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove image
                </button>
              </div>
            ) : (
              <div>
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium">Click to upload poster</p>
                <p className="text-gray-400 text-sm mt-2">
                  PNG, JPG, WebP (max 10MB)
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Recommended: 1000x1500px
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Backdrop Image *
            {errors.backdropFile && (
              <span className="text-red-400 text-sm ml-2">{errors.backdropFile}</span>
            )}
          </label>
          <div
            onClick={() => backdropInputRef.current?.click()}
            className={`border-3 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              errors.backdropFile 
                ? 'border-red-500 bg-red-500/5' 
                : backdropFile
                ? 'border-green-500 bg-green-500/5'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              ref={backdropInputRef}
              type="file"
              onChange={(e) => handleFileChange(e, 'backdrop')}
              accept="image/*"
              className="hidden"
            />
            
            {backdropFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Image className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{backdropFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(backdropFile.size)}
                  </p>
                </div>
                {backdropFile && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(backdropFile)}
                      alt="Backdrop preview"
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <p className="text-xs text-gray-400 mt-2">Preview</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBackdropFile(null);
                  }}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove image
                </button>
              </div>
            ) : (
              <div>
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium">Click to upload backdrop</p>
                <p className="text-gray-400 text-sm mt-2">
                  PNG, JPG, WebP (max 10MB)
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Recommended: 1920x1080px
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/30 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Upload Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Content Type:</span>
              <span className="font-medium capitalize">{formData.contentType}</span>
            </div>
            
            {isEpisode && selectedSeries && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Series:</span>
                  <span className="font-medium">{selectedSeries.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Season/Episode:</span>
                  <span className="font-medium">S{formData.seasonNumber}E{formData.episodeNumber}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-400">Title:</span>
              <span className="font-medium">{formData.title || 'Not set'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Trailer:</span>
              <span className="font-medium">{formData.youtubeTrailerLink ? '✓ Set' : '✗ Missing'}</span>
            </div>
            
            {!isEpisode && (
              <div className="flex justify-between">
                <span className="text-gray-400">Categories:</span>
                <span className="font-medium">{formData.categories.length}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-400">{isSeries ? 'Series Price:' : 'View Price:'}</span>
              <span className="font-medium">
                {CURRENCIES.find(c => c.value === formData.currency)?.symbol || 'RWF'}
                {formData.viewPrice.toFixed(2)}
              </span>
            </div>
            
            {videoFile && (isMovie || isEpisode) && (
              <div className="flex justify-between">
                <span className="text-gray-400">Video:</span>
                <span className="font-medium">{formatFileSize(videoFile.size)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-400">Poster:</span>
              <span className="font-medium">
                {posterFile ? '✓ Uploaded' : '✗ Missing'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Backdrop:</span>
              <span className="font-medium">
                {backdropFile ? '✓ Uploaded' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Upload Content</h1>
              <p className="text-gray-400 mt-1">
                Share your {formData.contentType} with the world
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/filmmaker')}
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300">
                {formData.contentType === 'movie' ? 'Movie' : 
                 formData.contentType === 'series' ? 'Series' : 'Episode'} 
                uploaded successfully! Awaiting admin approval. Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      activeStep >= step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs mt-2 text-gray-400">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      activeStep > step.id ? 'bg-blue-500' : 'bg-gray-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step Content */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {activeStep < steps.length ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                Next Step
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploadLoading || uploadSuccess}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {uploadLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {formData.contentType === 'movie' ? 'Movie' : 
                           formData.contentType === 'series' ? 'Series' : 'Episode'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploadLoading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading movie…</span>
                <span>{uploadProgress}%</span>
              </div>

              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Please don't close this window
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UploadMovie;