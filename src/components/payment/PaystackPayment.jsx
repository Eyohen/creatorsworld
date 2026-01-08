import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { paymentApi } from '../../api';

const PaystackPayment = ({
  amount,
  email,
  requestId,
  onSuccess,
  onClose,
  disabled = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify payment after Paystack callback
  const verifyPayment = async (reference) => {
    try {
      console.log('Verifying payment with reference:', reference);
      const verifyResponse = await paymentApi.verify(reference);
      console.log('Verification response:', verifyResponse.data);

      if (verifyResponse.data.success) {
        console.log('Payment verified successfully!');
        if (onSuccess) {
          onSuccess(reference, verifyResponse.data.data);
        }
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment through our backend first
  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('=== FRONTEND: Initializing payment ===');
      console.log('RequestId:', requestId, 'Amount:', amount);

      // Step 1: Initialize payment on our backend (creates Payment record)
      const { data } = await paymentApi.initialize(requestId, amount);
      console.log('Backend response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      const { reference } = data.data;
      console.log('Payment initialized with reference:', reference);

      // Step 2: Open Paystack popup with the reference from backend
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100,
        currency: 'NGN',
        ref: reference,
        onClose: function() {
          console.log('Payment popup closed');
          setLoading(false);
          if (onClose) onClose();
        },
        callback: function(response) {
          console.log('=== FRONTEND: Payment callback received ===');
          console.log('Response:', response);
          // Trigger async verification
          verifyPayment(response.reference);
        }
      });

      handler.openIframe();

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 px-6 py-3
          bg-green-600 hover:bg-green-700 disabled:bg-gray-400
          text-white font-semibold rounded-lg
          transition-all duration-200
          disabled:cursor-not-allowed
          ${className}
        `}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        {loading ? 'Processing...' : 'Pay to Escrow'}
      </button>
    </div>
  );
};

export default PaystackPayment;
