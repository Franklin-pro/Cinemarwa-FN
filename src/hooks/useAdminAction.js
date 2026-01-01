import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  blockUserAction, 
  unblockUserAction, 
  deleteUserAction,
  approveFilmmakerAction,
  approveMovieAction,
  clearError,
  clearSuccessMessage
} from '../store/slices/adminSlice';

export const useAdminActions = () => {
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const showToast = (message, type = 'success') => {
    const toastOptions = {
      duration: 4000,
      position: 'top-right',
    };

    if (type === 'success') {
      toast.success(message, toastOptions);
    } else {
      toast.error(message, toastOptions);
    }
  };

  const showConfirmation = (config) => {
    setModalConfig(config);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setModalConfig(null);
    setInputValue('');
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  };

  // Block User with reason
  const handleBlockUser = (userId, userName) => {
    showConfirmation({
      title: 'Block User',
      message: `Are you sure you want to block ${userName || 'this user'}?`,
      type: 'block',
      confirmText: 'Block User',
      isDestructive: true,
      inputField: {
        label: 'Reason for blocking',
        type: 'textarea',
        placeholder: 'Enter reason for blocking...',
        description: 'This reason will be visible to the user',
        required: true
      },
      onConfirm: async () => {
        if (!inputValue.trim()) {
          showToast('Please provide a reason for blocking', 'error');
          return;
        }

        try {
          await dispatch(blockUserAction({ userId, reason: inputValue })).unwrap();
          showToast('User blocked successfully');
          closeModal();
        } catch (error) {
          showToast(error || 'Failed to block user', 'error');
        }
      }
    });
  };

  // Unblock User
  const handleUnblockUser = (userId, userName) => {
    showConfirmation({
      title: 'Unblock User',
      message: `Are you sure you want to unblock ${userName || 'this user'}?`,
      type: 'unblock',
      confirmText: 'Unblock User',
      onConfirm: async () => {
        try {
          await dispatch(unblockUserAction(userId)).unwrap();
          showToast('User unblocked successfully');
          closeModal();
        } catch (error) {
          showToast(error || 'Failed to unblock user', 'error');
        }
      }
    });
  };

  // Delete User
  const handleDeleteUser = (userId, userName) => {
    showConfirmation({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete ${userName || 'this user'}'s account?`,
      type: 'delete',
      confirmText: 'Delete Account',
      isDestructive: true,
      itemName: userName,
      inputField: {
        label: 'Reason for deletion',
        type: 'textarea',
        placeholder: 'Enter reason for deletion...',
        description: 'This action cannot be undone. All user data will be permanently removed.',
        required: true
      },
      onConfirm: async () => {
        if (!inputValue.trim()) {
          showToast('Please provide a reason for deletion', 'error');
          return;
        }

        try {
          await dispatch(deleteUserAction(userId)).unwrap();
          showToast('User account deleted successfully');
          closeModal();
        } catch (error) {
          showToast(error || 'Failed to delete user', 'error');
        }
      }
    });
  };

  // Approve Filmmaker
  const handleApproveFilmmaker = (filmmakerId, filmmakerName) => {
    showConfirmation({
      title: 'Approve Filmmaker',
      message: `Are you sure you want to approve ${filmmakerName || 'this filmmaker'}?`,
      type: 'success',
      confirmText: 'Approve Filmmaker',
      onConfirm: async () => {
        try {
          await dispatch(approveFilmmakerAction({
            filmmakerId,
            data: {
              status: 'approved',
              approvedAt: new Date().toISOString()
            }
          })).unwrap();
          showToast('Filmmaker approved successfully');
          closeModal();
        } catch (error) {
          showToast(error || 'Failed to approve filmmaker', 'error');
        }
      }
    });
  };

  // Approve Movie
  const handleApproveMovie = (movieId, movieTitle) => {
    showConfirmation({
      title: 'Approve Movie',
      message: `Are you sure you want to approve "${movieTitle || 'this movie'}"?`,
      type: 'success',
      confirmText: 'Approve Movie',
      onConfirm: async () => {
        try {
          await dispatch(approveMovieAction({
            movieId,
            data: {
              status: 'approved',
              approvedAt: new Date().toISOString()
            }
          })).unwrap();
          showToast('Movie approved successfully');
          closeModal();
        } catch (error) {
          showToast(error || 'Failed to approve movie', 'error');
        }
      }
    });
  };
  

  return {
    showConfirmModal,
    setShowConfirmModal,
    modalConfig,
    inputValue,
    setInputValue,
    handleBlockUser,
    handleUnblockUser,
    handleDeleteUser,
    handleApproveFilmmaker,
    handleApproveMovie,
    closeModal,
    showToast
  };
};