import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, CreditCard, User, DollarSign, Building } from 'lucide-react';

function BankVerificationModal({
  isOpen,
  filmmaker,
  onVerify,
  onCancel,
  isLoading = false,
}) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleVerify = () => {
    onVerify(notes);
  };

  const handleCancel = () => {
    setNotes('');
    setError('');
    onCancel();
  };

  if (!isOpen || !filmmaker) return null;

  const bankDetails = filmmaker.filmmmakerFinance || {};
  const bankInfo = filmmaker.bankDetails || filmmaker.bankAccount || {};

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {/* Modal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
            <h2 className="text-lg font-bold text-white">Verify Bank Details</h2>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Filmmaker Info */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{filmmaker.name}</h3>
                  <p className="text-sm text-gray-400">{filmmaker.email}</p>
                  {filmmaker.phone && (
                    <p className="text-sm text-gray-400">{filmmaker.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Bank Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Holder */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Account Holder Name</p>
                  <p className="text-white font-medium">
                    {bankInfo.accountHolderName || filmmaker.name || 'N/A'}
                  </p>
                </div>

                {/* Bank Name */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Bank Name</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {bankInfo.bankName || 'N/A'}
                  </p>
                </div>

                {/* Account Number */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Account Number</p>
                  <p className="text-white font-medium font-mono">
                    {bankInfo.accountNumber
                      ? `****${bankInfo.accountNumber.slice(-4)}`
                      : 'N/A'}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                  <p className="text-white font-medium capitalize">
                    {bankDetails.payoutMethod || 'N/A'}
                  </p>
                </div>

                {/* SWIFT Code */}
                {bankInfo.swiftCode && (
                  <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">SWIFT Code</p>
                    <p className="text-white font-medium font-mono">{bankInfo.swiftCode}</p>
                  </div>
                )}

                {/* Routing Number */}
                {bankInfo.routingNumber && (
                  <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Routing Number</p>
                    <p className="text-white font-medium font-mono">
                      {bankInfo.routingNumber}
                    </p>
                  </div>
                )}

                {/* Minimum Withdrawal */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Minimum Withdrawal</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {bankDetails.minimumWithdrawalAmount || '0'}
                  </p>
                </div>

                {/* Platform Fee */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Platform Fee</p>
                  <p className="text-white font-medium">
                    {bankDetails.platformFeePercentage || '0'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Verification Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Status */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Current Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        bankInfo.verified ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    />
                    <p className="text-white font-medium capitalize">
                      {bankInfo.verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>

                {/* Application Date */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Applied On</p>
                  <p className="text-white font-medium text-sm">
                    {filmmaker.createdAt
                      ? new Date(filmmaker.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Notes */}
            <div className="space-y-3 border-t border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-white">Verification Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Documents verified, account confirmed with bank..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
              />
              <p className="text-xs text-gray-500">{notes.length}/500 characters</p>
            </div>

            {/* Info Alert */}
            <div className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                Verify this bank account only after confirming all details match the
                filmmaker's official documentation.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Bank Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BankVerificationModal;
