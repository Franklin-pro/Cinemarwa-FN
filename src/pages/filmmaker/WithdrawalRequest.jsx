import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  ArrowRight, 
  Wallet,
  History,
  Clock,
  Check,
  X,
  AlertTriangle,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';

function WithdrawalHistory() {
  const navigate = useNavigate();
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, thisMonth, lastMonth, thisYear
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatRwf = (value) => {
    return `RWF ${formatCurrency(value)}`;
  };

  useEffect(() => {
    fetchWithdrawalHistory();
    fetchStats();
  }, []);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const response = await filmmmakerService.getWithdrawalHistory();
      setWithdrawalHistory(response.data?.withdrawalHistory || []);
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
      setError('Failed to load withdrawal history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await filmmmakerService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWithdrawalHistory();
    fetchStats();
  };

  const handleExport = () => {
    // Export functionality would go here
    alert('Export functionality would download a CSV file of your withdrawal history');
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const getPaymentMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'momo':
        return '📱';
      case 'bank_transfer':
      case 'bank':
        return '🏦';
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🌐';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch(method?.toLowerCase()) {
      case 'momo': return 'MoMo';
      case 'bank_transfer':
      case 'bank': return 'Bank Transfer';
      case 'stripe': return 'Stripe';
      case 'paypal': return 'PayPal';
      default: return method || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPeriodLabel = (period) => {
    switch(period) {
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      default: return 'All Time';
    }
  };

  // Filter withdrawals based on selected filters
  const filteredWithdrawals = withdrawalHistory.filter(withdrawal => {
    // Status filter
    if (filter !== 'all' && withdrawal.status?.toLowerCase() !== filter) {
      return false;
    }

    // Period filter
    if (selectedPeriod !== 'all') {
      const withdrawalDate = new Date(withdrawal.createdAt || withdrawal.date);
      const now = new Date();
      
      switch(selectedPeriod) {
        case 'thisMonth':
          return withdrawalDate.getMonth() === now.getMonth() && 
                 withdrawalDate.getFullYear() === now.getFullYear();
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return withdrawalDate.getMonth() === lastMonth.getMonth() && 
                 withdrawalDate.getFullYear() === lastMonth.getFullYear();
        case 'thisYear':
          return withdrawalDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        withdrawal.transactionId?.toLowerCase().includes(query) ||
        withdrawal.amount?.toString().includes(query) ||
        withdrawal.payoutMethod?.toLowerCase().includes(query) ||
        withdrawal.status?.toLowerCase().includes(query) ||
        formatDate(withdrawal.createdAt).toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate statistics
  const totalWithdrawn = filteredWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const pendingCount = filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'pending').length;
  const completedCount = filteredWithdrawals.filter(w => w.status?.toLowerCase() === 'completed').length;

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading withdrawal history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-7xl pt-16 mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/dashboard/filmmaker')}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </div>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
                <span>Withdrawal History</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Track all your automatic withdrawal requests and payments
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRwf(totalWithdrawn)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredWithdrawals.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pendingCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Period Filter */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="thisMonth">This Month</option>
                      <option value="lastMonth">Last Month</option>
                      <option value="thisYear">This Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  Status: {filter}
                  <button onClick={() => setFilter('all')} className="ml-1 text-blue-500 hover:text-blue-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPeriod !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                  Period: {getPeriodLabel(selectedPeriod)}
                  <button onClick={() => setSelectedPeriod('all')} className="ml-1 text-purple-500 hover:text-purple-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Withdrawals Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Withdrawal Transactions
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({filteredWithdrawals.length} records)
                  </span>
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredWithdrawals.length} of {withdrawalHistory.length}
                </div>
              </div>
            </div>

            {error && !refreshing && (
              <div className="m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {refreshing ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-900 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Refreshing data...</p>
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <FileText className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No withdrawal transactions found
                </h4>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchQuery || filter !== 'all' || selectedPeriod !== 'all' 
                    ? 'Try changing your filters or search query'
                    : 'You haven\'t made any withdrawal requests yet. Funds are automatically withdrawn when available.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredWithdrawals.map((withdrawal, index) => (
                      <tr key={withdrawal.id || withdrawal.transactionId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {withdrawal.transactionId || `TXN-${(withdrawal.id || '').slice(-8)}`}
                            </p>
                            {withdrawal.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                                {withdrawal.notes}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatRwf(withdrawal.amount)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPaymentMethodIcon(withdrawal.payoutMethod)}</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {getPaymentMethodLabel(withdrawal.payoutMethod)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(withdrawal.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                              {getStatusText(withdrawal.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-gray-700 dark:text-gray-300">{formatDate(withdrawal.createdAt)}</p>
                            {withdrawal.completedAt && withdrawal.status === 'completed' && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Completed: {formatDate(withdrawal.completedAt)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                            onClick={() => {
                              // Show more details in a modal or separate page
                              alert(`Transaction Details:\n\nID: ${withdrawal.transactionId || withdrawal.id}\nAmount: ${formatRwf(withdrawal.amount)}\nStatus: ${withdrawal.status}\nMethod: ${getPaymentMethodLabel(withdrawal.payoutMethod)}\nDate: ${formatDate(withdrawal.createdAt)}\nNotes: ${withdrawal.notes || 'None'}`);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination (if needed) */}
            {filteredWithdrawals.length > 10 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing 1 to 10 of {filteredWithdrawals.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Previous
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      1
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      2
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This view shows filtered transactions for {getPeriodLabel(selectedPeriod)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRwf(totalWithdrawn)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total filtered amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WithdrawalHistory;