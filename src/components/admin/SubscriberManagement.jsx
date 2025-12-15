import React, { useState, useEffect } from 'react';
import { Mail, Loader, AlertCircle, Trash2, Send, Eye } from 'lucide-react';
import { subscribeService } from '../../services/api/subscribe';

function SubscriberManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(20);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({
    subject: '',
    message: '',
    htmlMessage: '',
    imageFile: null,
    imagePreview: null,
  });
  const [notifySending, setNotifySending] = useState(false);

  // Fetch subscribers
  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, filterActive]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');
      const filter = filterActive === 'all' ? {} : { isActive: filterActive === 'active' };
      const response = await subscribeService.getSubscribers({
        ...filter,
        limit,
        skip: currentPage * limit,
      });
      setSubscribers(response.data.data || []);
      setTotalSubscribers(response.data.count || 0);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch subscribers';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

const handleToggleActive = async (email, currentStatus) => {
  try {
    setError('');

    await subscribeService.changeSubscribeStatus({
      email,
      status: currentStatus ? 'inactive' : 'active',
    });

    setSuccess(
      `Subscriber ${currentStatus ? 'deactivated' : 'activated'} successfully`
    );
    setTimeout(() => setSuccess(''), 3000);
    fetchSubscribers();
  } catch (err) {
    const errorMsg =
      err.response?.data?.message || 'Failed to update subscriber status';
    setError(errorMsg);
  }
};


const handleSendNotification = async (e) => {
  e.preventDefault();

  if (!notifyForm.subject || !notifyForm.message) {
    setError('Subject and message are required');
    return;
  }

  try {
    setNotifySending(true);
    setError('');

    let response;
    // If an image is attached, use FormData
    if (notifyForm.imageFile) {
      const formData = new FormData();
      formData.append('subject', notifyForm.subject);
      formData.append('message', notifyForm.message);
      formData.append('htmlMessage', notifyForm.htmlMessage || notifyForm.message);
      formData.append('image', notifyForm.imageFile);
      response = await subscribeService.notifySubscribers(formData);
    } else {
      response = await subscribeService.notifySubscribers({
        subject: notifyForm.subject,
        message: notifyForm.message,
        htmlMessage: notifyForm.htmlMessage || notifyForm.message,
      });
    }

    const { successful, failed, total } = response.data.data;

    setSuccess(
      `Notifications sent successfully to ${successful}/${total} subscribers`
    );

    setShowNotifyModal(false);
    if (notifyForm.imagePreview) {
      try { URL.revokeObjectURL(notifyForm.imagePreview); } catch(e) {}
    }
    setNotifyForm({ subject: '', message: '', htmlMessage: '', imageFile: null, imagePreview: null });
    setTimeout(() => setSuccess(''), 5000);
  } catch (err) {
    console.error('Notify error:', err);
    
    const errorMsg =
      err.response?.data?.message || 'Failed to send notifications';
    setError(errorMsg);
  } finally {
    setNotifySending(false);
  }
};


  const totalPages = Math.ceil(totalSubscribers / limit);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Subscriber Management</h2>
          <p className="text-gray-400">
            Total Subscribers: <span className="text-blue-400 font-semibold">{totalSubscribers}</span>
          </p>
        </div>
        <button
          onClick={() => setShowNotifyModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => {
              setFilterActive(filter.id);
              setCurrentPage(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterActive === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 rounded-lg">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No subscribers found</p>
        </div>
      ) : (
        <>
          {/* Subscribers Table */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700 bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-300">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-300">Email</th>
                  {/* <th className="px-6 py-3 text-left font-semibold text-gray-300">Name</th> */}
                  <th className="px-6 py-3 text-left font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-300">Subscribed</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {subscribers.map((subscriber, idx) => (
                  <tr key={subscriber.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-gray-400">
                      {currentPage * limit + idx + 1}
                    </td>
                    <td className="px-6 py-3 text-gray-200">{subscriber.email}</td>
                    {/* <td className="px-6 py-3 text-gray-300">{subscriber.name || 'N/A'}</td> */}
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          subscriber.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}
                      >
                        {subscriber.status ==='active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(subscriber.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(subscriber.email, subscriber.isActive)}
                          title={subscriber.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded transition-colors ${
                            subscriber.status ==='active'
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalSubscribers)} of {totalSubscribers}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Send Notification to All Subscribers</h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={notifyForm.subject}
                  onChange={(e) => setNotifyForm({ ...notifyForm, subject: e.target.value })}
                  placeholder="Email subject"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                  placeholder="Message content"
                  rows="4"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HTML Message (optional)
                </label>
                <textarea
                  value={notifyForm.htmlMessage}
                  onChange={(e) => setNotifyForm({ ...notifyForm, htmlMessage: e.target.value })}
                  placeholder="HTML content for email (if different from message)"
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attach Image (optional) - PNG/JPEG, max 2MB
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        setError('Image must be smaller than 2MB');
                        return;
                      }
                      // Revoke previous preview if present
                      if (notifyForm.imagePreview) {
                        try { URL.revokeObjectURL(notifyForm.imagePreview); } catch(e) {}
                      }
                      setNotifyForm({
                        ...notifyForm,
                        imageFile: file,
                        imagePreview: URL.createObjectURL(file),
                      });
                      setError('');
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
                {notifyForm.imagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={notifyForm.imagePreview} alt="preview" className="w-20 h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        if (notifyForm.imagePreview) {
                          try { URL.revokeObjectURL(notifyForm.imagePreview); } catch(e){}
                        }
                        setNotifyForm({ ...notifyForm, imageFile: null, imagePreview: null });
                      }}
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifyModal(false);
                    if (notifyForm.imagePreview) {
                      try { URL.revokeObjectURL(notifyForm.imagePreview); } catch(e) {}
                    }
                    setNotifyForm({ subject: '', message: '', htmlMessage: '', imageFile: null, imagePreview: null });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notifySending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {notifySending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriberManagement;
