import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  blockUserAction,
  unblockUserAction,
  deleteUserAction,
} from '../../store/slices/adminSlice';
import { 
  Ban, 
  Unlock, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  User, 
  Film, 
  Shield,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import ConfirmActionModal from '../../components/ConfirmationModal';

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, pagination } = useSelector((state) => state.admin);

  const [actionInProgress, setActionInProgress] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    type: null,
    user: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openModal = (type, user) => {
    setModal({ open: true, type, user });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, user: null });
  };

const formatEmail = (email) => {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  // Show first 2 characters, then mask the rest of local part
  const maskedLocal = localPart.length > 2 
    ? localPart.slice(0, 2) + '****' + localPart.slice(-1)
    : localPart;
    
  return `${maskedLocal}@${domain}`;
};

// Example: "john.doe@example.com" → "jo****e@example.com"

  const handleConfirmAction = async () => {
    const { type, user } = modal;
    if (!user) return;

    setActionInProgress(user.id);

    if (type === 'block') {
      await dispatch(blockUserAction({ userId: user.id, reason: 'Blocked by admin' }));
    } else if (type === 'unblock') {
      await dispatch(unblockUserAction(user.id));
    } else if (type === 'delete') {
      await dispatch(deleteUserAction(user.id));
    }

    setActionInProgress(null);
    closeModal();
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleNext = () => {
    if (pagination.currentPage < pagination.totalPages) {
      dispatch(fetchUsers({ page: pagination.currentPage + 1 }));
    }
  };
  const handlePrevious = () => {
    if (pagination.currentPage > 1) {
      dispatch(fetchUsers({ page: pagination.currentPage - 1 }));
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'filmmaker': return <Film className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'filmmaker': return 'bg-blue-900/30 text-blue-400 border-blue-700/50';
      default: return 'bg-gray-800 text-gray-400 border-gray-700/50';
    }
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/50">
          <XCircle className="w-3 h-3 mr-1" /> Blocked
        </span>
      );
    }
    
    if (user.approvalStatus === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
          Pending Approval
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
        <CheckCircle className="w-3 h-3 mr-1" /> Active
      </span>
    );
  };

  const getFilmmakerStats = (user) => {
    if (user.role !== 'filmmaker') return null;
    
    return (
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <Film className="w-3 h-3" />
          <span>{user.filmmmakerStatsTotalMovies || 0} movies</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Revenue: ${parseFloat(user.filmmmakerStatsTotalRevenue || 0).toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === 'blocked') {
      filtered = filtered.filter(user => user.isBlocked);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(user => user.approvalStatus === 'pending');
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(user => !user.isBlocked && user.approvalStatus === 'approved');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const modalConfig = {
    block: {
      title: 'Block User',
      description: `Are you sure you want to block ${modal.user?.name}? They will no longer be able to access the platform.`,
      confirmText: 'Block User',
      confirmColor: 'yellow',
      icon: <Ban className="w-6 h-6 text-yellow-500" />
    },
    unblock: {
      title: 'Unblock User',
      description: `Do you want to unblock ${modal.user?.name}? They will regain access to the platform.`,
      confirmText: 'Unblock User',
      confirmColor: 'green',
      icon: <Unlock className="w-6 h-6 text-green-500" />
    },
    delete: {
      title: 'Delete User',
      description: `This will permanently delete ${modal.user?.name}'s account and all associated data. This action cannot be undone.`,
      confirmText: 'Delete User',
      confirmColor: 'red',
      icon: <Trash2 className="w-6 h-6 text-red-500" />
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-400">Manage platform users and permissions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="px-3 py-1 bg-gray-800 rounded-lg">
            Total: {pagination?.total || users.length} users
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="filmmaker">Filmmaker</option>
              <option value="viewer">Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-700">
              {filteredAndSortedUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-700/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{ formatEmail(user.email)}</p>
                    </div>
                    {getStatusBadge(user)}
                  </div>

                  <div className="text-sm text-gray-400 mb-3">
                    <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                    {getFilmmakerStats(user)}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-700">
                    {user.isBlocked ? (
                      <button
                        onClick={() => openModal('unblock', user)}
                        disabled={actionInProgress === user.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
                      >
                        <Unlock className="w-4 h-4" />
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal('block', user)}
                        disabled={actionInProgress === user.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 disabled:opacity-50"
                      >
                        <Ban className="w-4 h-4" />
                        Block
                      </button>
                    )}
                    <button
                      onClick={() => openModal('delete', user)}
                      disabled={actionInProgress === user.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        User
                        {sortConfig.key === 'name' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center gap-1">
                        Joined
                        {sortConfig.key === 'createdAt' && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left">Stats</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">{formatEmail(user.email)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {user.role === 'filmmaker' ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-400">Revenue:</span>{' '}
                              <span className="font-medium">RWF {parseFloat(user.filmmmakerStatsTotalRevenue || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('delete', user)}
                            disabled={actionInProgress === user.id}
                            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {user.isBlocked ? (
                            <button
                              onClick={() => openModal('unblock', user)}
                              disabled={actionInProgress === user.id}
                              className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-colors"
                              title="Unblock User"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openModal('block', user)}
                              disabled={actionInProgress === user.id}
                              className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 disabled:opacity-50 transition-colors"
                              title="Block User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrevious() }
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handleNext() }
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <ConfirmActionModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        loading={actionInProgress === modal.user?.id}
        {...(modal.type ? modalConfig[modal.type] : {})}
      />
    </div>
  );
}

export default UserManagement;