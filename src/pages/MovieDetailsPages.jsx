import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Star, 
  Play, 
  Download, 
  ArrowLeft, 
  Loader, 
  AlertCircle,
  Clock,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Film,
  Award,
  Info,
  Shield,
  Smartphone,
  Monitor
} from 'lucide-react';
import { moviesAPI } from '../services/api/movies';

function MovieDetailsPages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [showAccessInfo, setShowAccessInfo] = useState(false);

  const fetchMovie = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await moviesAPI.getMovieById(id);
      
      let movieData;
      if (response.data && response.data.data) {
        movieData = response.data.data;
      } else if (response.data) {
        movieData = response.data;
      } else {
        movieData = response;
      }
      
      setMovie(movieData);
      
      // Check user access from the API response
      if (movieData.userAccess) {
        setAccessStatus(movieData.userAccess);
      } else {
        setAccessStatus({
          hasAccess: false,
          accessType: null,
          expiresAt: null,
          requiresPurchase: movieData.price > 0
        });
      }
      
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError('Failed to load movie details');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  const handleWatchClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }

    if (accessStatus?.hasAccess) {
      // User already has access, navigate to player
      navigate(`/watch/${id}`);
    } else {
      // User needs to purchase
      navigate(`/payment/${id}?type=movie_watch`);
    }
  };

  const handleDownloadClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }

    if (accessStatus?.hasAccess && accessStatus?.accessType === 'download') {
      // Trigger download
      window.open(movie.videoUrl, '_blank');
    } else {
      // Purchase download access
      navigate(`/payment/${id}?type=movie_download`);
    }
  };

  const handleInstantWatch = () => {
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }
    navigate(`/watch/${id}`);
  };

  const getPosterUrl = () => {
    if (!movie) return null;
    
    if (movie.poster?.startsWith('http')) {
      return movie.poster;
    }
    
    if (movie.backdrop?.startsWith('http')) {
      return movie.backdrop;
    }
    
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
  };

  const getBackdropUrl = () => {
    if (!movie) return null;
    
    if (movie.backdrop?.startsWith('http')) {
      return movie.backdrop;
    }
    
    if (movie.poster?.startsWith('http')) {
      return movie.poster;
    }
    
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getAccessBadge = () => {
    if (!accessStatus) return null;
    
    if (accessStatus.hasAccess) {
      return (
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {accessStatus.accessType === 'download' ? 'Download Access' : 'Watch Access'}
          </span>
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-full">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Purchase Required</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <Film className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <p className="text-gray-400 mt-4">Loading cinematic experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Content Unavailable</h2>
          <p className="text-gray-300 mb-6">{error || 'The movie you\'re looking for is currently unavailable.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Browse Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Background Backdrop */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/60 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <div className="flex items-center gap-4">
                {getAccessBadge()}
                <button
                  onClick={() => setShowAccessInfo(!showAccessInfo)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Access Information"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Access Info Modal */}
        {showAccessInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAccessInfo(false)}
            ></div>
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Access Information</h3>
                <button
                  onClick={() => setShowAccessInfo(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              {accessStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <div className="flex items-center gap-2">
                      {accessStatus.hasAccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-400 font-medium">Access Granted</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-400 font-medium">No Access</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {accessStatus.accessType && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Access Type</span>
                      <span className="text-white font-medium capitalize">{accessStatus.accessType}</span>
                    </div>
                  )}
                  
                  {accessStatus.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expires</span>
                      <span className="text-white">
                        {new Date(accessStatus.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      {accessStatus.hasAccess 
                        ? 'You can now watch or download this movie.'
                        : 'Purchase required to access this content.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No access information available.</p>
              )}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Movie Poster & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Movie Poster */}
              <div className="relative group">
                <div className="relative rounded-2xl overflow-hidden aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900">
                  <img
                    src={getPosterUrl()}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Quality Badge */}
                  {movie.videoQuality && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
                      <span className="text-xs font-semibold text-white">{movie.videoQuality}</span>
                    </div>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="text-sm font-semibold">{formatDuration(movie.videoDuration)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <p className="text-xs text-gray-400">Views</p>
                    <p className="text-sm font-semibold">{movie.totalViews?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Award className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="text-sm font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Movie Metadata */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Movie Details</h3>
                <div className="space-y-4">
                  {movie.categories && movie.categories.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {movie.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {movie.language && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Language</p>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{movie.language.toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                    
                    {movie.release_date && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Release Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {new Date(movie.release_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {movie.fileSize && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">File Size</p>
                      <p className="text-sm font-medium">{formatFileSize(movie.fileSize * 1024 * 1024)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Movie Info & Actions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Rating */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {movie.title}
                    </h1>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(movie.vote_average || 0 / 2)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400">
                        {movie.vote_average?.toFixed(1) || 'N/A'} • {movie.vote_count?.toLocaleString() || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {movie.description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Access Buttons */}
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-900/30 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Get Access Now</h2>
                    <p className="text-gray-400 mt-1">Choose your viewing option</p>
                  </div>
                  {movie.price > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Starting from</p>
                      <p className="text-3xl font-bold">
                        {movie.currency === 'RWF' ? 'RWF' : '$'}{movie.price}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Instant Watch Button */}
                  {accessStatus?.hasAccess ? (
                    <button
                      onClick={handleInstantWatch}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Play className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">Watch Now</h3>
                              <p className="text-blue-100/80">Stream instantly in {movie.videoQuality || 'HD'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-sm">
                            <span className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              Available on all devices
                            </span>
                            <span className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Secure streaming
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">ACCESS GRANTED</div>
                          <div className="text-sm text-blue-200/80">Click to start watching</div>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={handleWatchClick}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25"
                      disabled={!user}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Play className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">Stream Online</h3>
                              <p className="text-blue-100/80">Watch in {movie.videoQuality || 'HD'} for 48 hours</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-sm">
                            <span className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4" />
                              Watch on mobile & TV
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              48-hour access
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {movie.currency === 'RWF' ? 'RWF' : '$'}{movie.viewPrice || movie.price}
                          </div>
                          <div className="text-sm text-blue-200/80">One-time payment</div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadClick}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-2xl border border-gray-700 hover:border-gray-600"
                    disabled={!user}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Download className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {accessStatus?.hasAccess && accessStatus?.accessType === 'download' 
                                ? 'Download Now' 
                                : 'Download & Keep Forever'
                              }
                            </h3>
                            <p className="text-gray-400">
                              {movie.videoQuality || 'HD'} • {formatFileSize(movie.fileSize * 1024 * 1024)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            DRM-Free
                          </span>
                          <span className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Lifetime access
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {accessStatus?.hasAccess && accessStatus?.accessType === 'download' ? (
                          <>
                            <div className="text-2xl font-bold text-green-400">READY TO DOWNLOAD</div>
                            <div className="text-sm text-gray-400">Click to download</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              {movie.currency === 'RWF' ? 'RWF' : '$'}{movie.downloadPrice || movie.price * 1.5}
                            </div>
                            <div className="text-sm text-gray-400">One-time purchase</div>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Payment Info */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>30-Day Refund</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>

                {/* User Access Status */}
                {user && accessStatus && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${accessStatus.hasAccess ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                          {accessStatus.hasAccess ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Your Access Status</p>
                          <p className="text-sm text-gray-400">
                            {accessStatus.hasAccess 
                              ? `You have ${accessStatus.accessType} access${accessStatus.expiresAt ? ` until ${new Date(accessStatus.expiresAt).toLocaleDateString()}` : ''}`
                              : 'Purchase required to access this content'
                            }
                          </p>
                        </div>
                      </div>
                      {accessStatus.hasAccess && (
                        <button
                          onClick={handleInstantWatch}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                        >
                          Watch Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolution</span>
                      <span className="font-medium">{movie.videoQuality || '1080p'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-medium">{formatDuration(movie.videoDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Size</span>
                      <span className="font-medium">{formatFileSize(movie.fileSize * 1024 * 1024)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format</span>
                      <span className="font-medium">MP4 / H.264</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Availability</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Streaming</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${movie.streamingUrl ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {movie.streamingUrl ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Download</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${movie.videoUrl ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {movie.videoUrl ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">HLS Streaming</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${movie.hlsUrl ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {movie.hlsUrl ? 'Available' : 'Standard Only'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MovieDetailsPages;