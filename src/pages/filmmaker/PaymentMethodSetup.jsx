import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';

function PaymentMethodSetup() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    // MoMo
    momoPhoneNumber: '',
    // Bank Transfer
    bankAccountHolder: '',
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    routingNumber: '',
    swiftCode: '',
    country: 'US',
    // Stripe
    stripeAccountId: '',
    paymentMethod: 'momo', // 'momo', 'bank_transfer', 'stripe'
  });

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      const response = await filmmmakerService.getPaymentMethod();
      if (response.data) {
        setPaymentMethod(response.data);

        // Map backend response to form data
        const newFormData = { ...formData };
        newFormData.paymentMethod = response.data.currentMethod || 'momo';

        // Extract MoMo details
        if (response.data.paymentDetails?.momo) {
          newFormData.momoPhoneNumber = response.data.paymentDetails.momo;
        }

        // Extract Bank details
        if (response.data.paymentDetails?.allMethods?.bankDetails) {
          const bankDetails = response.data.paymentDetails.allMethods.bankDetails;
          newFormData.bankAccountHolder = bankDetails.accountName || '';
          newFormData.bankName = bankDetails.bankName || '';
          newFormData.accountNumber = bankDetails.accountNumber || '';
          newFormData.accountType = bankDetails.accountType || 'checking';
          newFormData.routingNumber = bankDetails.routingNumber || '';
          newFormData.swiftCode = bankDetails.swiftCode || '';
          newFormData.country = bankDetails.country || 'US';
        }

        // Extract Stripe details
        if (response.data.paymentDetails?.allMethods?.stripeAccountId) {
          newFormData.stripeAccountId = response.data.paymentDetails.allMethods.stripeAccountId;
        }

        setFormData(newFormData);
      }
    } catch (err) {
      console.error('Error fetching payment method:', err);
      setError('Failed to load payment method');
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
    if (formData.paymentMethod === 'momo') {
      if (!formData.momoPhoneNumber) {
        setError('Please enter your MoMo phone number');
        return false;
      }
      // Validate phone number format (international format)
 if (!/^(078|079)\d{7}$/.test(formData.momoPhoneNumber)) {
  setError('Enter your MTN Mobile Money phone number (e.g., 0781234567)');
  return false;
}
    } else if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankAccountHolder || !formData.bankName || !formData.accountNumber) {
        setError('Please fill in all bank_transfer account details');
        return false;
      }
      if (formData.accountNumber.length < 8) {
        setError('Account number must be at least 8 characters');
        return false;
      }
    } else if (formData.paymentMethod === 'stripe') {
      if (!formData.stripeAccountId) {
        setError('Please enter your Stripe account ID');
        return false;
      }
      if (!formData.stripeAccountId.startsWith('acct_')) {
        setError('Stripe account ID must start with "acct_"');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Build payload with only the relevant fields for the selected payment method
      let payload = {
        payoutMethod: formData.paymentMethod, // Backend expects 'payoutMethod' not 'paymentMethod'
      };

      if (formData.paymentMethod === 'momo') {
        payload.momoPhoneNumber = formData.momoPhoneNumber;
      } else if (formData.paymentMethod === 'bank_transfer') {
        payload.bankAccountHolder = formData.bankAccountHolder;
        payload.bankName = formData.bankName;
        payload.accountNumber = formData.accountNumber;
        payload.accountType = formData.accountType;
        payload.routingNumber = formData.routingNumber;
        payload.swiftCode = formData.swiftCode;
        payload.country = formData.country;
      } else if (formData.paymentMethod === 'stripe') {
        payload.stripeAccountId = formData.stripeAccountId;
      }

      const response = await filmmmakerService.updatePaymentMethod(payload);

      if (response.data) {
        setPaymentMethod(response.data);
        setSuccess('Payment method updated successfully!');
        setTimeout(() => {
          navigate('/dashboard/filmmaker');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.message || 'Failed to update payment method');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading payment method...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-2xl pt-16 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/filmmaker')}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-400" />
            Payment Method Setup
          </h1>
          <p className="text-gray-400">Add or update your payment method for withdrawals</p>
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

        {/* Current Payment Method */}
        {paymentMethod && (
          <div className="mb-8 bg-gray-800/40 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Current Payment Method
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Type:</span> {paymentMethod.currentMethod?.toUpperCase()}
              </p>
              {paymentMethod.currentMethod === 'momo' && paymentMethod.paymentDetails?.momo && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Phone Number:</span> {paymentMethod.paymentDetails.momo}
                </p>
              )}
              {paymentMethod.currentMethod === 'bank_transfer' && paymentMethod.paymentDetails?.allMethods?.bankDetails && (
                <>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Bank:</span> {paymentMethod.paymentDetails.allMethods.bankDetails.bankName}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Account Holder:</span> {paymentMethod.paymentDetails.allMethods.bankDetails.accountName}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Account:</span> ****{paymentMethod.paymentDetails.allMethods.bankDetails.accountNumber?.slice(-4)}
                  </p>
                </>
              )}
              {paymentMethod.currentMethod === 'stripe' && paymentMethod.paymentDetails?.allMethods?.stripeAccountId && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Stripe Account:</span> {paymentMethod.paymentDetails.allMethods.stripeAccountId}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Payment Type Selection */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method Type</h2>

            <div className="space-y-4">
              {/* MoMo */}
              <label className="flex items-start gap-3 p-4 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition"
                style={{
                  backgroundColor: formData.paymentMethod === 'momo' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                  borderColor: formData.paymentMethod === 'momo' ? 'rgba(234, 179, 8, 0.5)' : 'inherit',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={formData.paymentMethod === 'momo'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">MoMo (Mobile Money)</p>
                  <p className="text-xs text-gray-400">Receive payments via MTN Mobile Money</p>
                </div>
              </label>

              {/* Bank Transfer */}
              {/* <label className="flex items-start gap-3 p-4 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition"
                style={{
                  backgroundColor: formData.paymentMethod === 'bank_transfer' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                  borderColor: formData.paymentMethod === 'bank_transfer' ? 'rgba(234, 179, 8, 0.5)' : 'inherit',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">Bank Transfer</p>
                  <p className="text-xs text-gray-400">Direct bank_transfer account deposit (ACH, Wire Transfer)</p>
                </div>
              </label> */}

              {/* Stripe */}
              {/* <label className="flex items-start gap-3 p-4 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition"
                style={{
                  backgroundColor: formData.paymentMethod === 'stripe' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                  borderColor: formData.paymentMethod === 'stripe' ? 'rgba(234, 179, 8, 0.5)' : 'inherit',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={formData.paymentMethod === 'stripe'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">Stripe</p>
                  <p className="text-xs text-gray-400">Connect your Stripe account for payouts</p>
                </div>
              </label> */}
            </div>
          </div>

          {/* Bank Transfer Form */}
          {formData.paymentMethod === 'bank_transfer' && (
            <div className="bg-gray-800/40 dia border border-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Bank Account Details</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="bankAccountHolder"
                    value={formData.bankAccountHolder}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Chase Bank"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="••••••••••••••••"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    placeholder="000000000"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SWIFT Code
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    placeholder="CHASUS33"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="EU">Europe</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
                <p className="font-semibold mb-2">Security Note:</p>
                <p>Your banking details are encrypted and secure. We never store full account numbers.</p>
              </div>
            </div>
          )}

          {/* MoMo Form */}
          {formData.paymentMethod === 'momo' && (
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">MoMo (Mobile Money) Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  MoMo Phone Number *
                </label>
                <input
                  type="tel"
                  name="momoPhoneNumber"
                  value={formData.momoPhoneNumber}
                  onChange={handleChange}
                  placeholder="079******* OR 078****"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter your MTN Mobile Money phone number in international format (e.g., 079***** OR 078*****)
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200 space-y-2">
                <p className="font-semibold">MoMo Setup Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Ensure your MoMo account is active and registered</li>
                  <li>Your phone number must be registered with MTN</li>
                  <li>You'll receive a verification code via SMS</li>
                  <li>Processing time: 1-2 business days</li>
                </ul>
              </div>
            </div>
          )}

          {/* Stripe Form */}
          {formData.paymentMethod === 'stripe' && (
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Stripe Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stripe Account ID *
                </label>
                <input
                  type="text"
                  name="stripeAccountId"
                  value={formData.stripeAccountId}
                  onChange={handleChange}
                  placeholder="acct_1234567890ABCDEFGH"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
                <p className="font-semibold mb-2">Stripe Setup:</p>
                <p>Connect your Stripe Express account to receive payouts directly to your bank_transfer.</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/filmmaker')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-600 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Payment Method'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentMethodSetup;
