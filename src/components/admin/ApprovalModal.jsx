import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

function ApprovalModal({
  isOpen,
  filmmakerName,
  onApprove,
  onCancel,
  isLoading = false,
  approvalType = 'filmmaker' // 'filmmaker', 'movie', etc.
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleApprove = () => {
    // Reason is optional but validate if needed
    onApprove(reason);
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  const modalTitle = approvalType === 'filmmaker'
    ? `Approve Filmmaker: ${filmmakerName}`
    : `Approve Content: ${filmmakerName}`;

  const buttonText = approvalType === 'filmmaker'
    ? 'Approve Filmmaker'
    : 'Approve Content';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {/* Modal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">{modalTitle}</h2>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Info Text */}
            <div className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                {approvalType === 'filmmaker'
                  ? 'Add an optional reason for this approval. This will be recorded in the system.'
                  : 'Add an optional reason for this approval. This will be recorded in the system.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Reason Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Approval Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Documents verified, meets quality standards, excellent track record..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-700">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApprovalModal;
