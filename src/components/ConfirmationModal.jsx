import React from 'react';
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning",
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <AlertCircle className="w-12 h-12 text-amber-400" />,
      confirmButton: "bg-amber-500 hover:bg-amber-600 text-white",
      cancelButton: "bg-gray-700 hover:bg-gray-600 text-white"
    },
    danger: {
      icon: <XCircle className="w-12 h-12 text-red-400" />,
      confirmButton: "bg-red-500 hover:bg-red-600 text-white",
      cancelButton: "bg-gray-700 hover:bg-gray-600 text-white"
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-400" />,
      confirmButton: "bg-green-500 hover:bg-green-600 text-white",
      cancelButton: "bg-gray-700 hover:bg-gray-600 text-white"
    },
    info: {
      icon: <HelpCircle className="w-12 h-12 text-blue-400" />,
      confirmButton: "bg-blue-500 hover:bg-blue-600 text-white",
      cancelButton: "bg-gray-700 hover:bg-gray-600 text-white"
    }
  };

  const styles = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {styles.icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400">{message}</p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 ${styles.cancelButton} rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 ${styles.confirmButton} rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;