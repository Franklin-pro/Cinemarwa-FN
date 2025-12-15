import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingMovies,
  fetchFlaggedContent,
  approveMovieAction,
} from '../../store/slices/adminSlice';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function ContentModeration() {
  const dispatch = useDispatch();
  const { pendingMovies, flaggedContent, loading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('pending');
  const [flaggedType, setFlaggedType] = useState('all');
  const [approvalInProgress, setApprovalInProgress] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingMovies());
    dispatch(fetchFlaggedContent(flaggedType));
  }, [dispatch, flaggedType]);

  const handleApproveMovie = async (movieId) => {
    setApprovalInProgress(movieId);
    await dispatch(
      approveMovieAction({
        movieId,
        data: { status: 'approved' },
      })
    );
    setApprovalInProgress(null);
  };

  const handleRejectMovie = async (movieId) => {
    setApprovalInProgress(movieId);
    await dispatch(
      approveMovieAction({
        movieId,
        data: { status: 'rejected', reason: 'Admin rejection' },
      })
    );
    setApprovalInProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Pending Movies ({pendingMovies.length})
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'flagged'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Flagged Content ({flaggedContent.length})
        </button>
      </div>

      {/* Pending Movies */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading && pendingMovies.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : pendingMovies.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
              <p className="text-gray-400">No pending movies for review</p>
            </div>
          ) : (
            pendingMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Poster */}
                  {movie.posterUrl && (
                    <div className="sm:col-span-1">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className={movie.posterUrl ? 'sm:col-span-2' : 'sm:col-span-3'}>
                    <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{movie.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {/* <div>
                        <p className="text-gray-400">Director</p>
                        <p className="font-medium">{movie.directorName}</p>
                      </div> */}
                      <div>
                        <p className="text-gray-400">Release Date</p>
                        <p className="font-medium">
                          {new Date(movie.release_date).toLocaleDateString()}
                        </p>
                      </div>
                      {/* <div>
                        <p className="text-gray-400">Genre</p>
                        <p className="font-medium">{movie.genre}</p>
                      </div> */}
                      <div>
                        <p className="text-gray-400">Duration</p>
                        <p className="font-medium">{movie.videoDuration} secs</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveMovie(movie.id)}
                        disabled={approvalInProgress === movie.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition-all"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {approvalInProgress === movie.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectMovie(movie.id)}
                        disabled={approvalInProgress === movie.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-medium transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        {approvalInProgress === movie.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Flagged Content */}
      {activeTab === 'flagged' && (
        <div className="space-y-6">
          {/* Filter */}
          <div>
            <select
              value={flaggedType}
              onChange={(e) => setFlaggedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
            >
              <option value="all">All Flagged Content</option>
              <option value="comments">Flagged Comments</option>
              <option value="reviews">Flagged Reviews</option>
              <option value="movies">Flagged Movies</option>
              <option value="users">Flagged Users</option>
            </select>
          </div>

          {/* Flagged Items */}
          <div className="space-y-4">
            {loading && flaggedContent.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : flaggedContent.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
                <p className="text-gray-400">No flagged content</p>
              </div>
            ) : (
              flaggedContent.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 border border-yellow-600/30 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{item.title || item.content}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            <span className="font-medium">Reported by:</span> {item.reportedBy}
                          </p>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Reason:</span> {item.reason}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-600/30 border border-yellow-600 rounded-full text-xs font-medium text-yellow-400">
                          {item.type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm transition-all">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm transition-all">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentModeration;
