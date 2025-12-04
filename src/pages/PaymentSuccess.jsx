import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Download, Play, ArrowRight } from 'lucide-react';
import { getPaymentHistory } from '../store/slices/paymentSlice';

function PaymentSuccess() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { paymentHistory } = useSelector((state) => state.payments);

  const getUsers = useSelector((state) => state.auth.user);
  const userId = getUsers?.id;
  console.log('User ID:', userId);

  useEffect(() => {
    // Fetch payment history to get transaction details
    dispatch(getPaymentHistory());
  }, [dispatch]);

  // Find the transaction details
  const transaction = paymentHistory.find((t) => t.id === transactionId);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>

          {/* Message */}
          <p className="text-gray-400 mb-6">
            Your payment has been processed successfully. You can now access the movie.
          </p>

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transaction ID</span>
                <span className="text-white font-mono text-xs">{transaction.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-semibold">${transaction.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Date</span>
                <span className="text-white">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white capitalize">{transaction.method}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Watch/Download Button */}
            <button
              onClick={() => navigate(`/movie/${transaction?.movieId}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {transaction?.type === 'watch' ? (
                <>
                  <Play className="w-5 h-5" />
                  Watch Now
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Movie
                </>
              )}
            </button>

            {/* Continue Button */}
            <button
              onClick={() => navigate('/dashboard/viewer')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Email Confirmation */}
          <p className="text-gray-400 text-sm mt-6">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Access your purchase in the "My Downloads" or "Continue Watching" section</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">2.</span>
              <span>You have the right to watch/download as per your purchase option</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Need help? Contact our support team at support@filmnyarwanda.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
