import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle, CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';

function WithdrawalRequest() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    withdrawalMethod: 'bank',
    notes: '',
  });

  const MINIMUM_WITHDRAWAL = 50;

  console.log('Payment Method:', paymentMethod);

  // Helper function to safely convert to number and format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes, financeRes, paymentRes] = await Promise.all([
        filmmmakerService.getStats(),
        filmmmakerService.getWithdrawalHistory(),
        filmmmakerService.getFinancialSummary(),
        filmmmakerService.getPaymentMethod(),
      ]);

      setStats(statsRes.data);
      setWithdrawalHistory(historyRes.data?.withdrawals || []);
      setFinance(financeRes.data);
      setPaymentMethod(paymentRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load withdrawal information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    // Check if payment method is configured
    if (!paymentMethod?.currentMethod) {
      setError('You must configure a payment method before requesting a withdrawal. Please go to Payment Methods settings.');
      return false;
    }

    const amount = parseFloat(formData.amount);
    const availableBalance = finance?.balance?.pendingBalance || stats?.availableBalance || 0;

    if (!formData.amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return false;
    }

    if (amount < MINIMUM_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL}`);
      return false;
    }

    if (amount > availableBalance) {
      setError(`Withdrawal amount exceeds available balance of $${formatCurrency(availableBalance)}`);
      return false;
    }

    if (!formData.withdrawalMethod) {
      setError('Please select a withdrawal method');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await filmmmakerService.requestWithdrawal(parseFloat(formData.amount));

      if (response.data) {
        setSuccess(`Withdrawal request of $${formData.amount} submitted successfully! You'll receive your funds in 5-7 business days.`);
        setFormData({
          amount: '',
          withdrawalMethod: 'bank',
          notes: '',
        });

        // Refresh data
        await fetchData();

        setTimeout(() => {
          navigate('/dashboard/filmmaker');
        }, 3000);
      }
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      setError(err.response?.data?.message || 'Failed to request withdrawal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading withdrawal information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-4xl pt-16 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/filmmaker')}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-400" />
            Request Withdrawal
          </h1>
          <p className="text-gray-400">Withdraw your earnings to your bank account or payment method</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-200">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Withdrawal Details</h2>

                {/* Balance Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {/* Available Balance */}
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${formatCurrency(finance?.balance?.pendingBalance || stats?.availableBalance || 0)}
                    </p>
                  </div>

                  {/* Pending Balance */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${formatCurrency(finance?.balance?.totalEarned || 0)}
                    </p>
                  </div>
                </div>

                {/* Payment Method Status */}
                {!paymentMethod?.currentMethod ? (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-200 font-semibold">No Payment Method Configured</p>
                      <p className="text-blue-100/70 text-sm mt-1">You must add a payment method before requesting a withdrawal</p>
                      <button
                        type="button"
                        onClick={() => navigate('/filmmaker/payment-method')}
                        className="mt-2 text-sm underline text-blue-300 hover:text-blue-200"
                      >
                        Go to Payment Methods →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      <span className="font-semibold">Payment Method:</span> {paymentMethod.currentMethod?.toUpperCase()}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  Minimum withdrawal: ${MINIMUM_WITHDRAWAL}
                </p>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Withdrawal Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">$</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min={MINIMUM_WITHDRAWAL}
                      max={stats?.availableBalance || 0}
                      className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {formData.amount && (
                    <p className="text-xs text-gray-400 mt-2">
                      You will receive: ${formatCurrency(parseFloat(formData.amount) * 0.95)} (after 5% fee)
                    </p>
                  )}
                </div>

                {/* Withdrawal Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Withdrawal Method *
                  </label>
                  <select
                    name="withdrawalMethod"
                    value={formData.withdrawalMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="momo">MoMo - Mobile Money (1-2 business days)</option>
                    <option value="bank">Bank Transfer (5-7 business days)</option>
                    <option value="stripe">Stripe (1-2 business days)</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any notes about this withdrawal request..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-sm text-blue-200">
                  <p className="font-semibold mb-2">Processing Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Withdrawals are processed on business days only</li>
                    <li>A 5% fee is deducted from your withdrawal amount</li>
                    <li>Minimum withdrawal is ${MINIMUM_WITHDRAWAL}</li>
                    <li>Processing time depends on your selected method (1-7 business days)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !paymentMethod?.currentMethod || !(finance?.balance?.pendingBalance || stats?.availableBalance)}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-600 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : !paymentMethod?.currentMethod ? (
                    <>
                      Configure Payment Method First
                    </>
                  ) : (
                    <>
                      Request Withdrawal
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Withdrawals Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Withdrawals</h3>

              {withdrawalHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No withdrawal requests yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {withdrawalHistory.slice(0, 5).map((withdrawal) => (
                    <div key={withdrawal._id} className="pb-3 border-b border-gray-700 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-white">${formatCurrency(withdrawal.amount || 0)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          withdrawal.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : withdrawal.status === 'pending'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{withdrawal.method}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/filmmaker/withdrawal-history')}
                className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-3 py-2 rounded-lg transition-all"
              >
                View Full History
              </button>
            </div>

            {/* Setup Payment Method Alert */}
            {!stats?.paymentMethodSet && (
              <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-200 mb-3">Setup Required</p>
                <p className="text-xs text-orange-100 mb-4">
                  You need to set up a payment method before requesting withdrawals.
                </p>
                <button
                  onClick={() => navigate('/filmmaker/payment-method')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  Set Payment Method
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WithdrawalRequest;
