import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentReconciliation } from '../../store/slices/adminSlice';
import { TrendingUp, DollarSign, Users, FileText } from 'lucide-react';

function PaymentReconciliation() {
  const dispatch = useDispatch();
  const { paymentReconciliation, loading } = useSelector((state) => state.admin);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    dispatch(fetchPaymentReconciliation(period));
  }, [dispatch, period]);

  if (loading || !paymentReconciliation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = paymentReconciliation;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Payment Reconciliation</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign className="w-8 h-8" />}
          change={stats.revenueChange}
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions || 0}
          icon={<FileText className="w-8 h-8" />}
          change={stats.transactionChange}
        />
        <StatCard
          title="Platform Fee"
          value={`$${(stats.platformFee || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <StatCard
          title="Filmmaker Payouts"
          value={`$${(stats.filmmmakerPayouts || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<Users className="w-8 h-8" />}
          change={stats.payoutChange}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {stats.paymentMethods && stats.paymentMethods.length > 0 ? (
              stats.paymentMethods.map((method) => (
                <div key={method.method} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium capitalize">{method.method}</p>
                    <p className="text-sm text-gray-400">{method.transactions} transactions</p>
                  </div>
                  <p className="text-lg font-bold">
                    ${method.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No payment data available</p>
            )}
          </div>
        </div>

        {/* Top Filmmakers */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6">Top Earning Filmmakers</h3>
          <div className="space-y-4">
            {stats.topFilmmmakers && stats.topFilmmmakers.length > 0 ? (
              stats.topFilmmmakers.slice(0, 5).map((filmmaker, idx) => (
                <div key={filmmaker._id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full font-bold text-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{filmmaker.name}</p>
                      <p className="text-sm text-gray-400">{filmmaker.movieCount} movies</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">
                    ${filmmaker.earnings.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No filmmaker data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-6">Pending Payouts</h3>
        <div className="space-y-4">
          {stats.pendingPayouts && stats.pendingPayouts.length > 0 ? (
            stats.pendingPayouts.map((payout) => (
              <div
                key={payout._id}
                className="flex items-center justify-between py-4 px-4 bg-gray-700/30 border border-gray-600 rounded-lg"
              >
                <div>
                  <p className="font-medium">{payout.filmmaker}</p>
                  <p className="text-sm text-gray-400">Requested: {new Date(payout.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${payout.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{payout.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">No pending payouts</p>
          )}
        </div>
      </div>

      {/* Reconciliation Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-6">Reconciliation Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Reconciled Amount</p>
            <p className="text-2xl font-bold">
              ${(stats.reconciledAmount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Unreconciled Amount</p>
            <p className="text-2xl font-bold text-yellow-400">
              ${(stats.unreconciledAmount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Discrepancies</p>
            <p className="text-2xl font-bold text-red-400">{stats.discrepancies || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, change }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <div className="text-blue-400 opacity-20">{icon}</div>
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {change !== undefined && (
        <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% from last period
        </p>
      )}
    </div>
  );
}

export default PaymentReconciliation;
