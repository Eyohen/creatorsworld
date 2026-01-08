import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi } from '../../api';
import {
  Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
  Shield, ChevronRight, AlertCircle, CheckCircle2, Loader2,
  CreditCard, Building2, X
} from 'lucide-react';

const Earnings = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [earningsRes, transactionsRes, accountsRes, payoutsRes] = await Promise.all([
        paymentApi.getEarnings(),
        paymentApi.getTransactions(),
        paymentApi.getBankAccounts(),
        paymentApi.getPayoutHistory(),
      ]);
      setStats(earningsRes.data.data);
      setTransactions(transactionsRes.data.data.transactions || []);
      setBankAccounts(accountsRes.data.data || []);
      setPayouts(payoutsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

    setPayoutLoading(true);
    try {
      await paymentApi.requestPayout({ amount, bankAccountId: selectedAccount });
      setSuccess('Payout request submitted successfully! You will receive funds within 1-3 business days.');
      setShowPayoutModal(false);
      setPayoutAmount('');
      setSelectedAccount('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const getPayoutStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl text-gray-900">Earnings</h1>
        <Link
          to="/creator/settings"
          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
        >
          <Building2 className="w-4 h-4" />
          Manage Bank Accounts
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-green-100 text-sm">Available Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(stats?.availableBalance)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={(stats?.availableBalance || 0) < 5000}
            className="flex-1 bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Withdraw Funds
          </button>
        </div>
        {(stats?.availableBalance || 0) < 5000 && (stats?.availableBalance || 0) > 0 && (
          <p className="text-green-100 text-sm mt-3">
            Minimum withdrawal: {formatCurrency(5000)}. You need {formatCurrency(5000 - (stats?.availableBalance || 0))} more.
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-sm">In Escrow</p>
          </div>
          <p className="font-bold text-2xl text-gray-900">{formatCurrency(stats?.pendingBalance || stats?.pendingEarnings)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting brand approval</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-500 text-sm">Total Earned</p>
          </div>
          <p className="font-bold text-2xl text-gray-900">{formatCurrency(stats?.totalEarnings)}</p>
          <p className="text-xs text-gray-400 mt-1">Lifetime earnings</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-gray-500 text-sm">Total Withdrawn</p>
          </div>
          <p className="font-bold text-2xl text-gray-900">{formatCurrency(stats?.totalWithdrawn)}</p>
          <p className="text-xs text-gray-400 mt-1">Successfully paid out</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-4">How Payments Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <p className="text-sm font-medium text-blue-900">Brand Pays</p>
              <p className="text-xs text-blue-700">Funds go to escrow</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <p className="text-sm font-medium text-blue-900">You Create</p>
              <p className="text-xs text-blue-700">Submit your content</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <p className="text-sm font-medium text-blue-900">Brand Approves</p>
              <p className="text-xs text-blue-700">Funds released to you</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <div>
              <p className="text-sm font-medium text-blue-900">Withdraw</p>
              <p className="text-xs text-blue-700">To your bank account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      {payouts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-900">Recent Payouts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {payouts.slice(0, 5).map((payout) => {
              const statusBadge = getPayoutStatusBadge(payout.status);
              return (
                <div key={payout.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
                      <p className="text-sm text-gray-500">{payout.bankName} - ****{payout.accountNumber?.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(payout.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-lg text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete collaborations to start earning</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'earning' ? 'bg-green-100' :
                    tx.type === 'escrow_release' ? 'bg-blue-100' :
                    tx.type === 'payout' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {tx.type === 'earning' || tx.type === 'escrow_release' ? (
                      <ArrowDownRight className={`w-5 h-5 ${tx.type === 'earning' ? 'text-green-600' : 'text-blue-600'}`} />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {tx.type === 'escrow_release' ? 'Escrow Released' : tx.type}
                    </p>
                    <p className="text-sm text-gray-500">{tx.description || tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'earning' || tx.type === 'escrow_release' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {tx.type === 'earning' || tx.type === 'escrow_release' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowPayoutModal(false); setError(''); }}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-xl text-gray-900">Withdraw Funds</h2>
              <button
                onClick={() => { setShowPayoutModal(false); setError(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-green-700 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.availableBalance)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter amount"
                    min="5000"
                    max={stats?.availableBalance || 0}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum: {formatCurrency(5000)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                {bankAccounts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No bank account added.</p>
                    <Link
                      to="/creator/settings"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Add one in settings →
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select account...</option>
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - ****{acc.accountNumber?.slice(-4)} ({acc.accountName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPayoutModal(false); setError(''); }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankAccounts.length === 0 || payoutLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {payoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Withdraw
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Funds typically arrive within 1-3 business days
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
