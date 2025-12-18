import React, { useEffect, useState, useRef } from 'react';
import { 
  User, Mail, Calendar, Shield, 
  Eye, Download, Star, Edit, 
  LogOut, Settings, Key, Trash2, 
  Moon, Sun, ChevronRight, RefreshCw, EyeOff, Eye as EyeIcon,
  Smartphone, Plus, AlertCircle, Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Local state for user - initialize from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDevicesDropdown, setShowDevicesDropdown] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [editForm, setEditForm] = useState({
    name: ''
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  // Get activeDevices from user object
  const activeDevices = user?.activeDevices || [];
  const currentDevices = activeDevices.length;
  const maxDevices = user?.maxDevices || 1;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDevicesDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update edit form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || ''
      });
    }
  }, [user]);

  // Fetch user data from API
  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch user data from your API
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.user || data);
      localStorage.setItem('user', JSON.stringify(data.user || data));
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (changePasswordError) {
      setChangePasswordError('');
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change submission
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setChangePasswordLoading(true);
    setChangePasswordError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Reset form and close modal on success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      setPasswordErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      // Show success message
      alert('Password changed successfully!');
      
      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error('Password change failed:', error);
      setChangePasswordError(error.message || 'An error occurred. Please try again.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Handle device removal
  const handleRemoveDevice = async (deviceId) => {
    if (!deviceId) {
      console.error('No device ID provided');
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this device?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/remove-device', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ deviceId })
        });

        if (response.ok) {
          // Refresh user data to get updated active devices
          await fetchUserData();
          alert('Device removed successfully');
        } else {
          alert('Failed to remove device');
        }
      } catch (error) {
        console.error('Error removing device:', error);
        alert('Error removing device');
      }
    }
  };

  // Handle logout from all devices
  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to logout from all devices?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/auth/logout-all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        navigate('/login');
      } catch (error) {
        console.error('Error logging out all devices:', error);
        alert('Error logging out all devices');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          
          navigate('/login');
          alert('Account deleted successfully');
        } else {
          alert('Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account');
      }
    }
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  // Handle edit profile submission
  const handleEditProfileSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  // Reset form when modal closes
  const handleClosePasswordModal = () => {
    setShowChangePassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordError('');
    setChangePasswordLoading(false);
  };

  // Get device browser name from user agent
  const getBrowserName = (userAgent) => {
    if (!userAgent) return 'Unknown Browser';
    
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Browser';
  };

  // Get device platform from user agent
  const getPlatform = (userAgent) => {
    if (!userAgent) return 'Unknown Platform';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    
    return 'Device';
  };

  // Get device name from device data
  const getDeviceName = (device) => {
    if (device?.deviceName) return device.deviceName;
    if (device?.userAgent) {
      if (device.userAgent.includes('Mobile')) return 'Mobile Device';
      if (device.userAgent.includes('Tablet')) return 'Tablet';
    }
    return getPlatform(device?.userAgent) || 'Device';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getAccountAge = () => {
    if (!user?.createdAt) return 'N/A';
    try {
      const created = new Date(user.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 'N/A';
    }
  };

  const renderDevicesDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDevicesDropdown(!showDevicesDropdown)}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        {currentDevices}/{maxDevices} Devices
        <ChevronRight className={`w-4 h-4 transition-transform ${showDevicesDropdown ? 'rotate-90' : ''}`} />
      </button>
      
      {showDevicesDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Active Devices</h4>
              <span className="text-sm text-gray-400">
                {currentDevices}/{maxDevices}
              </span>
            </div>
            
            {/* Device List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {activeDevices && activeDevices.length > 0 ? (
                activeDevices.map((device, index) => (
                  <div key={device?.deviceId || index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {device?.deviceName?.includes('Mobile') || 
                         device?.userAgent?.includes('Mobile') ? (
                          <Smartphone className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Monitor className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getDeviceName(device)}</p>
                        <p className="text-xs text-gray-400">
                          {getBrowserName(device?.userAgent)} • {device?.ipAddress || 'Unknown IP'}
                        </p>
                        {device?.loginAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last login: {formatDateTime(device.loginAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device?.deviceId)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove device"
                      disabled={activeDevices.length === 1}
                    >
                      <Trash2 className={`w-4 h-4 ${activeDevices.length === 1 ? 'opacity-30' : ''}`} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active devices</p>
                </div>
              )}
            </div>
            
            {/* Device Limit Warning */}
            {currentDevices >= maxDevices && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-400 font-medium">Device limit reached!</p>
                    <p className="text-xs text-amber-300/80 mt-1">
                      You've reached your maximum of {maxDevices} device(s).
                      {!user?.isUpgraded && ' Upgrade your account to add more devices.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upgrade Button */}
            {!user?.isUpgraded && (
              <button
                onClick={() => {
                  setShowDevicesDropdown(false);
                  navigate('/upgrade');
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Upgrade for More Devices
              </button>
            )}
            
            {/* Logout All Devices Button */}
            <button
              onClick={() => {
                setShowDevicesDropdown(false);
                handleLogoutAll();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout All Devices
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
          <div className="text-red-400 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Error Loading Profile</h3>
            <p className="text-gray-300">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">No User Found</h3>
          <p className="text-gray-400 mb-6">Please login to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Personal Information
          </h3>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                {user.name || 'Not set'}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {user.email}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Role</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 capitalize">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                  user.role === 'filmmaker' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {user.role || 'user'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Member Since</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Additional User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Account Status</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isUpgraded ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.isUpgraded ? 'Premium User' : 'Basic User'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Active Devices</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                {renderDevicesDropdown()}
              </div>
            </div>
          </div>
          
          {/* Subscription Status */}
          {user.isSubscribed !== undefined && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Newsletter Subscription</label>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isSubscribed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {user.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
      
      {/* Account Stats - Only show if data exists */}
      {(user.moviesWatched !== undefined || user.downloads !== undefined || user.reviews !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.moviesWatched !== undefined && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.moviesWatched || 0}</p>
                  <p className="text-sm text-gray-400">Movies Watched</p>
                </div>
              </div>
            </div>
          )}
          
          {user.downloads !== undefined && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.downloads || 0}</p>
                  <p className="text-sm text-gray-400">Downloads</p>
                </div>
              </div>
            </div>
          )}
          
          {user.reviews !== undefined && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.reviews || 0}</p>
                  <p className="text-sm text-gray-400">Reviews</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getAccountAge()}</p>
                <p className="text-sm text-gray-400">Days Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        
        <div className="space-y-3">
          <button 
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-400">Update your password</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="text-left">
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-400">{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* Device Management */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          Device Management
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active Devices</p>
              <p className="text-sm text-gray-400">{currentDevices} of {maxDevices} devices</p>
            </div>
            <button
              onClick={() => setShowDevicesDropdown(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              View All
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Type</p>
              <p className="text-sm text-gray-400">
                {user.isUpgraded ? 'Premium' : 'Basic'} - {maxDevices} device(s) allowed
              </p>
            </div>
            {!user.isUpgraded && (
              <button
                onClick={() => navigate('/upgrade')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all text-sm"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-gray-300 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm">Permanently delete your account and all data</p>
            </div>
          </button>
          
          <button 
            onClick={handleLogoutAll}
            className="w-full flex items-center gap-3 p-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Logout All Devices</p>
              <p className="text-sm">Sign out from all devices</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.name || 'User'}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'filmmaker' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Overview
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'settings' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
                
                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'danger' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Security
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Age</span>
                  <span className="font-bold">{getAccountAge()} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">User Role</span>
                  <span className="font-bold capitalize">{user.role || 'user'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className="font-bold">{user.isUpgraded ? 'Premium' : 'Basic'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Devices</span>
                  <span className="font-bold">{currentDevices}/{maxDevices}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl p-6">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'danger' && renderDangerZone()}
            </div>
            
            {/* Edit Profile Modal */}
            {isEditing && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Email</label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-400"
                        placeholder="Email cannot be changed"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditProfileSubmit}
                        className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Change Password Modal */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      Change Password
                    </h3>
                    <button
                      onClick={handleClosePasswordModal}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                    {changePasswordError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{changePasswordError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full bg-gray-800 border ${passwordErrors.currentPassword ? 'border-red-500/50' : 'border-gray-700'} rounded-lg px-4 py-3 pr-10`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full bg-gray-800 border ${passwordErrors.newPassword ? 'border-red-500/50' : 'border-gray-700'} rounded-lg px-4 py-3 pr-10`}
                          placeholder="Enter new password (min. 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full bg-gray-800 border ${passwordErrors.confirmPassword ? 'border-red-500/50' : 'border-gray-700'} rounded-lg px-4 py-3 pr-10`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClosePasswordModal}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={changePasswordLoading}
                        className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {changePasswordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Changing...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;