import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';

function WithdrawalHistory() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const STATUS_COLORS = {
    pending: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-blue-500/20 text-blue-400',
  };

  // Helper function to safely convert to number and format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const response = await filmmmakerService.getWithdrawalHistory();
      setWithdrawals(response.data?.withdrawals || []);
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
      setError('Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = filterStatus === 'all'
    ? withdrawals
    : withdrawals.filter(w => w.status === filterStatus);

  const stats = {
    total: withdrawals.reduce((sum, w) => w.status === 'completed' ? sum + (w.amount || 0) : sum, 0),
    pending: withdrawals.reduce((sum, w) => w.status === 'pending' ? sum + (w.amount || 0) : sum, 0),
    processing: withdrawals.reduce((sum, w) => w.status === 'processing' ? sum + (w.amount || 0) : sum, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading withdrawal history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-6xl pt-16 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/filmmaker')}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-blue-400" />
            Withdrawal History
          </h1>
          <p className="text-gray-400">View all your withdrawal requests and transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Withdrawn</p>
            <p className="text-3xl font-bold text-green-400">${formatCurrency(stats.total)}</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-blue-400">${formatCurrency(stats.pending)}</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Processing</p>
            <p className="text-3xl font-bold text-blue-400">${formatCurrency(stats.processing)}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-700 pb-4">
          {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-semibold transition-colors capitalize ${
                filterStatus === status
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Withdrawals Table */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No {filterStatus !== 'all' ? filterStatus : ''} withdrawals found</p>
              <button
                onClick={() => navigate('/filmmaker/withdrawal-request')}
                className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2 rounded-lg font-semibold"
              >
                Request a Withdrawal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Method</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Processing Time</th>
                    <th className="px-6 py-4 text-left font-semibold">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(withdrawal.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-400">
                        ${formatCurrency(withdrawal.amount || 0)}
                        <p className="text-xs text-gray-400 font-normal">
                          Fee: ${formatCurrency((withdrawal.amount || 0) * 0.05)}
                        </p>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span className="text-sm font-medium">{withdrawal.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[withdrawal.status] || STATUS_COLORS.pending}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm">
                            {withdrawal.method === 'bank' ? '5-7 days' : withdrawal.method === 'momo' ? '1-2 days' : '1-2 days'}
                          </p>
                          {withdrawal.completedAt && (
                            <p className="text-xs text-gray-400">
                              {new Date(withdrawal.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-gray-400">
                          {withdrawal.transactionId || withdrawal._id?.slice(-8) || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Withdrawal Button */}
        {filteredWithdrawals.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/filmmaker/withdrawal-request')}
              className="bg-blue-500 hover:bg-blue-600 text-black px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Request New Withdrawal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WithdrawalHistory;
