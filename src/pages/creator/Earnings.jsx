import { useState, useEffect } from 'react';
import { paymentApi } from '../../api';

const Earnings = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [earningsRes, transactionsRes, accountsRes] = await Promise.all([
        paymentApi.getEarnings(),
        paymentApi.getTransactions(),
        paymentApi.getBankAccounts(),
      ]);
      setStats(earningsRes.data.data);
      setTransactions(transactionsRes.data.data.transactions || []);
      setBankAccounts(accountsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAccount) {
      setError('Please select a bank account');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (!amount || amount < 5000) {
      setError('Minimum payout amount is ₦5,000');
      return;
    }

    if (amount > (stats?.availableBalance || 0)) {
      setError('Amount exceeds available balance');
      return;
    }

    try {
      await paymentApi.requestPayout({ amount, bankAccountId: selectedAccount });
      setSuccess('Payout request submitted successfully!');
      setShowPayoutModal(false);
      setPayoutAmount('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request payout');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-3xl text-gray-900">Earnings</h1>

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <p className="font-semibold text-3xl text-green-600">
            ₦{(stats?.availableBalance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="font-semibold text-3xl text-gray-900">
            ₦{(stats?.pendingBalance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Earned</p>
          <p className="font-semibold text-3xl text-gray-900">
            ₦{(stats?.totalEarnings || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Withdrawn</p>
          <p className="font-semibold text-3xl text-gray-900">
            ₦{(stats?.totalWithdrawn || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payout Button */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Request Payout</h2>
            <p className="text-sm text-gray-500">
              Minimum payout: ₦5,000 • Processing: 1-3 business days
            </p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={(stats?.availableBalance || 0) < 5000}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-xl text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'earning' ? 'bg-green-100' :
                    tx.type === 'payout' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {tx.type === 'earning' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.description || tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'earning' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'earning' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-2xl text-gray-900">Request Payout</h2>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance
                </label>
                <p className="text-2xl font-semibold text-green-600">
                  ₦{(stats?.availableBalance || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw (₦)
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                  min="5000"
                  max={stats?.availableBalance || 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                {bankAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No bank account added. <a href="/creator/settings" className="text-green-600 hover:underline">Add one in settings</a>
                  </p>
                ) : (
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select account...</option>
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountNumber} ({acc.accountName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankAccounts.length === 0}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Request Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
