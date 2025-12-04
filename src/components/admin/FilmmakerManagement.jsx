import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingFilmmakers,
  approveFilmmakerAction,
  verifyFilmmakerBankAction,
} from '../../store/slices/adminSlice';
import { CheckCircle, XCircle, FileText, DollarSign } from 'lucide-react';
import ApprovalModal from './ApprovalModal';
import BankVerificationModal from './BankVerificationModal';

function FilmmakerManagement() {
  const dispatch = useDispatch();
  const { pendingFilmmakers, loading } = useSelector((state) => state.admin);
  const [selectedFilmmaker, setSelectedFilmmaker] = useState(null);
  const [approveReason, setApproveReason] = useState('');
  const [approvalInProgress, setApprovalInProgress] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);
  const [isBankVerificationModalOpen, setIsBankVerificationModalOpen] = useState(false);
  const [pendingBankVerificationId, setPendingBankVerificationId] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingFilmmakers());
  }, [dispatch]);

  const handleOpenApprovalModal = (filmamakerId) => {
    setPendingApprovalId(filmamakerId);
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = async (reason) => {
    if (!pendingApprovalId) return;

    setApprovalInProgress(pendingApprovalId);
    await dispatch(
      approveFilmmakerAction({
        filmamakerId: pendingApprovalId,
        data: { status: 'approved', reason: reason },
      })
    );
    setApprovalInProgress(null);
    setIsApprovalModalOpen(false);
    setPendingApprovalId(null);
  };

  const handleCancelApproval = () => {
    setIsApprovalModalOpen(false);
    setPendingApprovalId(null);
  };

  const handleOpenBankVerificationModal = (filmamakerId) => {
    setPendingBankVerificationId(filmamakerId);
    setIsBankVerificationModalOpen(true);
  };

  const handleConfirmBankVerification = async (notes) => {
    if (!pendingBankVerificationId) return;

    setApprovalInProgress(pendingBankVerificationId);
    await dispatch(
      verifyFilmmakerBankAction({
        filmamakerId: pendingBankVerificationId,
        data: { verified: true, notes: notes },
      })
    );
    setApprovalInProgress(null);
    setIsBankVerificationModalOpen(false);
    setPendingBankVerificationId(null);
  };

  const handleCancelBankVerification = () => {
    setIsBankVerificationModalOpen(false);
    setPendingBankVerificationId(null);
  };

  const handleVerifyBank = async (filmamakerId) => {
    setApprovalInProgress(filmamakerId);
    await dispatch(
      verifyFilmmakerBankAction({
        filmamakerId,
        data: { verified: true },
      })
    );
    setApprovalInProgress(null);
  };

  // Get the filmmaker being approved for the modal
  const filmmmakerBeingApproved = pendingFilmmakers.find((f) => f._id === pendingApprovalId);
  const filmmmakerBeingBankVerified = pendingFilmmakers.find(
    (f) => f._id === pendingBankVerificationId
  );

  return (
    <div className="space-y-6">
      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        filmmakerName={filmmmakerBeingApproved?.name || 'Filmmaker'}
        onApprove={handleConfirmApproval}
        onCancel={handleCancelApproval}
        isLoading={approvalInProgress !== null}
        approvalType="filmmaker"
      />

      {/* Bank Verification Modal */}
      <BankVerificationModal
        isOpen={isBankVerificationModalOpen}
        filmmaker={filmmmakerBeingBankVerified}
        onVerify={handleConfirmBankVerification}
        onCancel={handleCancelBankVerification}
        isLoading={approvalInProgress !== null}
      />

      {/* Pending Approvals */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>

        {loading && pendingFilmmakers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pendingFilmmakers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No pending filmmaker approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFilmmakers.map((filmmaker) => (
              <div
                key={filmmaker._id}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">{filmmaker.name}</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Email:</span> {filmmaker.email}
                      </p>
                      <p>
                        <span className="text-gray-400">Phone:</span> {filmmaker.phone || 'N/A'}
                      </p>
                      <p>
                        <span className="text-gray-400">Applied:</span>{' '}
                        {new Date(filmmaker.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Verification Documents:</p>
                    <div className="space-y-2">
                      {filmmaker.verificationDocuments && filmmaker.verificationDocuments.length > 0 ? (
                        filmmaker.verificationDocuments.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {doc.type}
                          </a>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleOpenApprovalModal(filmmaker._id)}
                      disabled={approvalInProgress === filmmaker._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {approvalInProgress === filmmaker._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleOpenBankVerificationModal(filmmaker._id)}
                      disabled={approvalInProgress === filmmaker._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-all"
                    >
                      <DollarSign className="w-5 h-5" />
                      {approvalInProgress === filmmaker._id ? 'Verifying...' : 'Verify Bank'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilmmakerManagement;
