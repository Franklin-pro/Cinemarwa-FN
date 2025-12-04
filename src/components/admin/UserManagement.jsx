import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  blockUserAction,
  unblockUserAction,
  deleteUserAction,
} from '../../store/slices/adminSlice';
import { Ban, Unlock, Trash2 } from 'lucide-react';

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleBlockUser = async (userId) => {
    setActionInProgress(userId);
    await dispatch(blockUserAction({ userId, reason: 'Blocked by admin' }));
    setActionInProgress(null);
  };

  const handleUnblockUser = async (userId) => {
    setActionInProgress(userId);
    await dispatch(unblockUserAction(userId));
    setActionInProgress(null);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setActionInProgress(userId);
      await dispatch(deleteUserAction(userId));
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Users Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th>Status Approval</th>
                <th className="px-4 py-3 text-left font-semibold">Joined</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="px-4 py-4">{user.name}</td>
                  <td className="px-4 py-4 text-gray-400">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 bg-blue-600/30 border border-blue-600 rounded-full text-xs font-medium text-blue-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked
                          ? 'bg-red-600/30 border border-red-600 text-red-400'
                          : 'bg-green-600/30 border border-green-600 text-green-400'
                      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.approvalStatus ==='approved'
                          ? 'bg-green-600/30 border border-green-600 text-green-400'
                          : 'bg-yellow-600/30 border border-yellow-600 text-yellow-400'
                      }`}
                    >
                      {user.approvalStatus ==='approved' ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleUnblockUser(user._id)}
                          disabled={actionInProgress === user._id}
                          className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-all"
                          title="Unblock user"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user._id)}
                          disabled={actionInProgress === user._id}
                          className="p-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-all"
                          title="Block user"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={actionInProgress === user._id}
                        className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-all"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
