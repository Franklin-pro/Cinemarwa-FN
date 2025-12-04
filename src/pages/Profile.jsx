import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Lock, LogOut, Settings } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 space-y-6">
          {/* User Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 border-t border-gray-700 pt-6">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Member Since</p>
              <p className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-gray-700 pt-6">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2.5 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2.5 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Change Password */}
          <button className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-lg transition-all">
            <Lock className="w-5 h-5" />
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3">Danger Zone</h3>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;