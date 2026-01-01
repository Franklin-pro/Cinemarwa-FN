// components/AccessPrompt.jsx
import React from 'react';
import { Lock, Play, Download, LogIn, CreditCard } from 'lucide-react';

function AccessPrompt({ 
  movie, 
  user, 
  onLogin, 
  onPurchase, 
  hasAccess, 
  noStreamUrl = false 
}) {
  if (noStreamUrl) {
    return (
      <div className="text-center max-w-md p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Stream Unavailable</h3>
        <p className="text-gray-300 mb-6">
          This movie is not available for streaming at the moment.
        </p>
        <div className="space-y-3">
          {movie.downloadPrice && (
            <button
              onClick={() => window.location.href = `/payment/${movie.id}?type=movie_download`}
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              Download for {movie.currency || 'RWF'} {movie.downloadPrice}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center max-w-md p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <LogIn className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Sign In Required</h3>
        <p className="text-gray-300 mb-6">
          Please sign in to watch this movie or purchase access.
        </p>
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In to Watch
          </button>
          <button
            onClick={() => window.location.href = '/register'}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center max-w-md p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800">
        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Access Required</h3>
        <p className="text-gray-300 mb-6">
          Purchase this movie to start watching in {movie.videoQuality || 'HD'} quality
        </p>
        <div className="space-y-3">
          <button
            onClick={onPurchase}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <Play className="w-5 h-5" />
            Watch Now - {movie.currency || 'RWF'} {movie.viewPrice}
          </button>
          {movie.downloadPrice && (
            <button
              onClick={() => window.location.href = `/payment/${movie.id}?type=movie_download`}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              Download for {movie.currency || 'RWF'} {movie.downloadPrice}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default AccessPrompt;