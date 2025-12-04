import React from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AuthPromptModal({ isOpen, onClose, movieTitle }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/register');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-800 rounded-lg shadow-2xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Watch Limit Reached
          </h2>
          <p className="text-neutral-400 mb-4">
            You've watched 10 seconds of <span className="text-blue-400 font-semibold">{movieTitle}</span>
          </p>
          <p className="text-neutral-300 text-sm">
            Sign in or create an account to watch the full movie and enjoy unlimited streaming.
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral-800 text-neutral-400">Choose an option</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Login to Your Account
          </button>

          <button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Create New Account
          </button>
        </div>

        {/* Info Text */}
        <p className="text-center text-neutral-400 text-xs mt-6">
          Your account gives you access to full movies, personalized recommendations, and more.
        </p>
      </div>
    </div>
  );
}

export default AuthPromptModal;
