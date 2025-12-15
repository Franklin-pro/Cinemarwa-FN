import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingFilmmakers,
  approveFilmmakerAction,
  verifyFilmmakerBankAction,
} from '../../store/slices/adminSlice';
import { CheckCircle, XCircle, FileText, DollarSign, AlertCircle } from 'lucide-react';
import ApprovalModal from './FilmmakerApprovalModal';
import BankVerificationModal from './BankVerificationModal';

function FilmmakerManagement() {
  const dispatch = useDispatch();
  const { pendingFilmmakers, loading, error, successMessage, approvingId } = useSelector((state) => state.admin);
  
  const [selectedFilmmaker, setSelectedFilmmaker] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [bankVerificationModalOpen, setBankVerificationModalOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  useEffect(() => {
    dispatch(fetchPendingFilmmakers());
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        // You can dispatch clearSuccessMessage action here
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenApprovalModal = (filmmakerId) => {
    const filmmaker = pendingFilmmakers.find(f => f._id === filmmakerId || f.id === filmmakerId);
    setSelectedFilmmaker(filmmaker);
    setApprovalModalOpen(true);
    setModalErrorMessage('');
  };

  const handleConfirmApproval = async (reason) => {
    if (!selectedFilmmaker) return;

    try {
      const result = await dispatch(
        approveFilmmakerAction({
          filmmakerId: selectedFilmmaker._id || selectedFilmmaker.id,
          data: { 
            status: 'approved',
            reason: reason || 'Approved by admin'
           },
        })
      ).unwrap();

      if (result) {
        setApprovalModalOpen(false);
        setSelectedFilmmaker(null);
      }
    } catch (error) {
      setModalErrorMessage(error || 'Failed to approve filmmaker');
      console.error('Approval error:', error);
    }
  };

  const handleCancelApproval = () => {
    setApprovalModalOpen(false);
    setSelectedFilmmaker(null);
    setModalErrorMessage('');
  };

  const handleOpenBankVerificationModal = (filmmakerId) => {
    const filmmaker = pendingFilmmakers.find(f => f._id === filmmakerId || f.id === filmmakerId);
    setSelectedFilmmaker(filmmaker);
    setBankVerificationModalOpen(true);
    setModalErrorMessage('');
  };

  const handleConfirmBankVerification = async (notes) => {
    if (!selectedFilmmaker) return;

    try {
      const result = await dispatch(
        verifyFilmmakerBankAction({
          filmmakerId: selectedFilmmaker._id || selectedFilmmaker.id,
          data: { 
            verified: true, 
            notes: notes || 'Bank details verified by admin' 
          },
        })
      ).unwrap();

      if (result) {
        setBankVerificationModalOpen(false);
        setSelectedFilmmaker(null);
      }
    } catch (error) {
      setModalErrorMessage(error || 'Failed to verify bank details');
      console.error('Bank verification error:', error);
    }
  };

  const handleCancelBankVerification = () => {
    setBankVerificationModalOpen(false);
    setSelectedFilmmaker(null);
    setModalErrorMessage('');
  };

  const isApproving = (filmmakerId) => {
    return approvingId === filmmakerId;
  };

  // Get document URL safely
  const getDocumentUrl = (doc) => {
    if (typeof doc === 'string') return doc;
    if (doc && doc.url) return doc.url;
    return '#';
  };

  // Get document type
  const getDocumentType = (doc, index) => {
    if (typeof doc === 'string') return `Document ${index + 1}`;
    if (doc && doc.type) return doc.type;
    return 'Document';
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        filmmakerName={selectedFilmmaker?.name || 'Filmmaker'}
        onApprove={handleConfirmApproval}
        onCancel={handleCancelApproval}
        isLoading={isApproving(selectedFilmmaker?._id || selectedFilmmaker?.id)}
        error={modalErrorMessage}
        approvalType="filmmaker"
      />

      {/* Bank Verification Modal */}
      <BankVerificationModal
        isOpen={bankVerificationModalOpen}
        filmmaker={selectedFilmmaker}
        onVerify={handleConfirmBankVerification}
        onCancel={handleCancelBankVerification}
        isLoading={isApproving(selectedFilmmaker?._id || selectedFilmmaker?.id)}
        error={modalErrorMessage}
      />

      {/* Pending Approvals */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Pending Filmmaker Approvals</h2>
          <div className="text-sm text-gray-400">
            {pendingFilmmakers.length} pending {pendingFilmmakers.length === 1 ? 'filmmaker' : 'filmmakers'}
          </div>
        </div>

        {loading && pendingFilmmakers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading pending filmmakers...</p>
          </div>
        ) : pendingFilmmakers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending filmmaker approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFilmmakers.map((filmmaker) => (
              <div
                key={filmmaker._id || filmmaker.id}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 md:p-6 hover:border-gray-500 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Filmmaker Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold mb-2">{filmmaker.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Pending Approval
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {filmmaker.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16">Email:</span>
                        <span className="text-gray-300">{filmmaker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16">Phone:</span>
                        <span className="text-gray-300">{filmmaker.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-16">Applied:</span>
                        <span className="text-gray-300">
                          {filmmaker.createdAt 
                            ? new Date(filmmaker.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      {filmmaker.bankDetails && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-gray-400 text-sm mb-2">Bank Details:</p>
                          <div className="text-xs space-y-1">
                            <p>Account: {filmmaker.bankDetails.accountNumber || 'N/A'}</p>
                            <p>Bank: {filmmaker.bankDetails.bankName || 'N/A'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents & Actions */}
                  <div className="space-y-4">
                    {/* Documents Section */}
                    <div>
                      <p className="text-gray-400 text-sm mb-3 font-medium">Verification Documents:</p>
                      <div className="space-y-2">
                        {filmmaker.verificationDocuments && filmmaker.verificationDocuments.length > 0 ? (
                          filmmaker.verificationDocuments.map((doc, idx) => (
                            <a
                              key={idx}
                              href={getDocumentUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-blue-300">{getDocumentType(doc, idx)}</span>
                              <span className="ml-auto text-xs text-gray-500">View</span>
                            </a>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No documents uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenApprovalModal(filmmaker._id || filmmaker.id)}
                        disabled={isApproving(filmmaker._id || filmmaker.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                      >
                        {isApproving(filmmaker._id || filmmaker.id) ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve Filmmaker
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenBankVerificationModal(filmmaker._id || filmmaker.id)}
                        disabled={isApproving(filmmaker._id || filmmaker.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                      >
                        {isApproving(filmmaker._id || filmmaker.id) ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            Verify Bank
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading more indicator */}
      {loading && pendingFilmmakers.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-400">Updating list...</span>
        </div>
      )}
    </div>
  );
}

export default FilmmakerManagement;