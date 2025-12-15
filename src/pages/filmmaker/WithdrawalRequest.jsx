import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  ArrowRight, 
  CreditCard, 
  Wallet,
  Calendar,
  Clock,
  Shield,
  Smartphone,
  TrendingUp,
  Info,
  Building
} from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';
import { paymentsService } from '../../services/api/payments';
import { useSelector } from 'react-redux';

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

   const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    amount: '',
    notes: '',
  });

  const MINIMUM_WITHDRAWAL = 5; // 5 RWF minimum

  // Helper function to safely convert to number and format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatRwf = (value) => {
    return `RWF ${value}`;
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
      setWithdrawalHistory(historyRes.data?.withdrawalHistory || []);
      setFinance(financeRes.data.data);
      console.log('Payment Method Response:', financeRes.data.data);
      setPaymentMethod(paymentRes.data.data);
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
    const availableBalance = finance?.balance?.pendingBalance || finance?.balance?.availableBalance || 0;

    if (!formData.amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return false;
    }

    if (amount < MINIMUM_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is RWF ${formatCurrency(MINIMUM_WITHDRAWAL)}`);
      return false;
    }

    if (amount > availableBalance) {
      setError(`Withdrawal amount exceeds available balance of ${formatRwf(availableBalance)}`);
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

      const response = await paymentsService.requestWithdrawal(
        user.id,
        {
        amount: parseFloat(formData.amount),
        payoutMethod: paymentMethod.currentMethod,
        notes: formData.notes,
      });

      if (response.data?.success) {
        setSuccess(`Withdrawal request of ${formatRwf(formData.amount)} submitted successfully! You'll receive your funds in 3-5 business days.`);
        setFormData({
          amount: '',
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

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'momo': return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'paypal': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch(method) {
      case 'momo': return 'MTN Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'stripe': return 'Stripe';
      case 'paypal': return 'PayPal';
      default: return 'Bank Transfer';
    }
  };

  const getPaymentMethodDetails = () => {
    if (!paymentMethod?.currentMethod) return null;
    
    const method = paymentMethod.currentMethod;
    const details = paymentMethod.paymentDetails;
    
    switch(method) {
      case 'momo':
        return details?.momo ? `MoMo: ${details.momo}` : 'MoMo number not configured';
      case 'bank_transfer':
        return details?.bankDetails ? 
          `Bank: ${details.bankDetails.bankName} ••••${details.bankDetails.accountNumber?.slice(-4)}` : 
          'Bank details not configured';
      case 'stripe':
        return details?.stripeAccountId ? 'Stripe Connected Account' : 'Stripe not configured';
      case 'paypal':
        return details?.paypalEmail ? `PayPal: ${details.paypalEmail}` : 'PayPal not configured';
      default:
        return 'Payment method details';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading withdrawal information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-6xl pt-16 mx-auto">
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
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span>Request Withdrawal</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Withdraw your earnings directly to your configured payment method
              </p>
            </div>
            <div className="hidden md:block">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                Secure Transaction
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRwf(finance?.balance?.pendingBalance || finance?.balance?.availableBalance || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRwf(finance?.balance?.totalEarned || stats?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Minimum Withdrawal</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRwf(MINIMUM_WITHDRAWAL)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Withdrawal Form */}
          <div className="lg:col-span-2">
            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Attention Required</p>
                  <p className="text-red-600 dark:text-red-400/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-700 dark:text-green-300 font-medium">Success!</p>
                  <p className="text-green-600 dark:text-green-400/80 text-sm mt-1">{success}</p>
                </div>
              </div>
            )}

            {/* Withdrawal Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Withdrawal Request</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details to request a withdrawal</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Current Payment Method */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method
                    </label>
                    <div className={`p-4 rounded-lg border ${!paymentMethod?.currentMethod ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {paymentMethod?.currentMethod ? (
                            <>
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                {getPaymentMethodIcon(paymentMethod.currentMethod)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {getPaymentMethodLabel(paymentMethod.currentMethod)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                  {getPaymentMethodDetails()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-300">No Payment Method Configured</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400/80 mt-0.5">
                                  You must add a payment method before withdrawing
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        {!paymentMethod?.currentMethod && (
                          <button
                            type="button"
                            onClick={() => navigate('/filmmaker/payment-method')}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            Add Method
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Withdrawal Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 font-medium">RWF</div>
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0"
                        min={MINIMUM_WITHDRAWAL}
                        max={finance?.balance?.pendingBalance || finance?.balance?.availableBalance || 0}
                        className="w-full pl-16 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!paymentMethod?.currentMethod}
                      />
                      <div className="absolute right-3 top-3 text-sm text-gray-500 dark:text-gray-400">
                        Min: {formatRwf(MINIMUM_WITHDRAWAL)}
                      </div>
                    </div>
                    
                    {formData.amount && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Amount to receive:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatRwf(parseFloat(formData.amount))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any special instructions or notes for this withdrawal..."
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={!paymentMethod?.currentMethod}
                    />
                  </div>

                  {/* Processing Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">Processing Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Processing Time</p>
                          <p className="text-gray-600 dark:text-gray-400">immediately</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Business Days</p>
                          <p className="text-gray-600 dark:text-gray-400">Monday - Friday</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !paymentMethod?.currentMethod || !formData.amount || parseFloat(formData.amount) < MINIMUM_WITHDRAWAL}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                      !paymentMethod?.currentMethod || !formData.amount || parseFloat(formData.amount) < MINIMUM_WITHDRAWAL
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing Request...
                      </>
                    ) : !paymentMethod?.currentMethod ? (
                      'Configure Payment Method First'
                    ) : (
                      <>
                        Request Withdrawal
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Withdrawals & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Method Card */}
            {paymentMethod?.currentMethod && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Payment Method Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Method</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        {getPaymentMethodIcon(paymentMethod.currentMethod)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getPaymentMethodLabel(paymentMethod.currentMethod)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getPaymentMethodDetails()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/filmmaker/payment-method')}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 px-4 py-2 rounded-lg transition-all"
                  >
                    Update Payment Method
                  </button>
                </div>
              </div>
            )}

            {/* Recent Withdrawals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Withdrawals</h3>
                
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600">
                      <Wallet className="w-full h-full" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No withdrawal requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {withdrawalHistory.slice(0, 5).map((withdrawal, index) => (
                      <div 
                        key={withdrawal.id || index} 
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatRwf(withdrawal.amount || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {withdrawal.payoutMethod || withdrawal.method}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            withdrawal.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : withdrawal.status === 'pending'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {withdrawal.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(withdrawal.submittedAt || withdrawal.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {withdrawalHistory.length > 0 && (
                  <button
                    onClick={() => navigate('/filmmaker/withdrawal-history')}
                    className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 px-4 py-2 rounded-lg transition-all"
                  >
                    View Complete History
                  </button>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Secure Withdrawal</h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5"></div>
                  <span>All withdrawals are processed through secure payment gateways</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5"></div>
                  <span>Your funds are protected by industry-standard encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5"></div>
                  <span>Email notifications sent for all withdrawal activities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default WithdrawalRequest;