import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const hasVerified = useRef(false); // Prevent double API calls

  useEffect(() => {
    // Prevent double execution (React StrictMode calls useEffect twice)
    if (hasVerified.current) {
      console.log('Already attempted verification, skipping...');
      return;
    }

    if (token) {
      hasVerified.current = true;
      verifyEmail();
    } else {
      setStatus('error');
      setError('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      console.log('Calling verify API with token:', token);
      const response = await authApi.verifyEmail(token);
      console.log('Verify API response:', response.data);
      setStatus('success');
    } catch (err) {
      console.error('Verify API error:', err.response?.data || err.message);
      setStatus('error');
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-6"></div>
            <h2 className="font-semibold text-3xl text-gray-900">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-semibold text-3xl text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your email has been verified. You can now login.</p>
            <Link to="/login" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-semibold text-3xl text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/login" className="text-green-600 font-medium hover:underline">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
