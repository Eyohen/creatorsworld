import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, creatorApi, paymentApi } from '../../api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Settings = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Account settings
  const [accountForm, setAccountForm] = useState({
    displayName: '',
    email: '',
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [bankForm, setBankForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    if (user && profile) {
      setAccountForm({
        displayName: profile.displayName || '',
        email: user.email || '',
      });
    }
    loadBankAccounts();
    loadBankList();
  }, [user, profile]);

  const loadBankList = async () => {
    setBanksLoading(true);
    try {
      const { data } = await paymentApi.getBankList();
      setBankList(data.data || []);
    } catch (err) {
      console.error('Failed to load banks:', err);
    } finally {
      setBanksLoading(false);
    }
  };

  // Verify bank account when account number is complete
  const verifyBankAccount = useCallback(async (accountNumber, bankCode) => {
    if (accountNumber.length !== 10 || !bankCode) return;

    setVerifyingAccount(true);
    setAccountVerified(false);
    setVerificationError('');

    try {
      const { data } = await paymentApi.verifyBankAccount(accountNumber, bankCode);
      if (data.success && data.data.accountName) {
        setBankForm(prev => ({ ...prev, accountName: data.data.accountName }));
        setAccountVerified(true);
      } else {
        setVerificationError('Could not verify account');
      }
    } catch (err) {
      setVerificationError('Could not verify account. Please check the details.');
    } finally {
      setVerifyingAccount(false);
    }
  }, []);

  // Handle bank selection
  const handleBankChange = (e) => {
    const bankCode = e.target.value;
    const selectedBank = bankList.find(b => b.code === bankCode);
    setBankForm(prev => ({
      ...prev,
      bankCode,
      bankName: selectedBank?.name || '',
      accountName: '',
    }));
    setAccountVerified(false);
    setVerificationError('');

    // Verify if account number is already filled
    if (bankForm.accountNumber.length === 10) {
      verifyBankAccount(bankForm.accountNumber, bankCode);
    }
  };

  // Handle account number change
  const handleAccountNumberChange = (e) => {
    const accountNumber = e.target.value.replace(/\D/g, '').slice(0, 10);
    setBankForm(prev => ({ ...prev, accountNumber, accountName: '' }));
    setAccountVerified(false);
    setVerificationError('');

    // Auto-verify when 10 digits entered
    if (accountNumber.length === 10 && bankForm.bankCode) {
      verifyBankAccount(accountNumber, bankForm.bankCode);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const { data } = await paymentApi.getBankAccounts();
      setBankAccounts(data.data || []);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await creatorApi.updateProfile({ displayName: accountForm.displayName });
      await refreshProfile();
      setSuccess('Account updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentApi.addBankAccount(bankForm);
      loadBankAccounts();
      setShowAddBank(false);
      setBankForm({ bankCode: '', accountNumber: '', accountName: '' });
      setSuccess('Bank account added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    if (!confirm('Are you sure you want to remove this bank account?')) return;

    try {
      await paymentApi.deleteBankAccount(id);
      setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
      setSuccess('Bank account removed');
    } catch (err) {
      setError('Failed to remove bank account');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'password', label: 'Password' },
    { id: 'bank', label: 'Bank Accounts' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-semibold text-3xl text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="border-b border-gray-100 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={accountForm.displayName}
                  onChange={(e) => setAccountForm({ ...accountForm, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Your display name"
                />
                <p className="text-sm text-gray-500 mt-1">This is how you appear to brands</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Bank Accounts Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {bankAccounts.length === 0 && !showAddBank && (
                <div className="text-center py-8 text-gray-500">
                  <p>No bank accounts added yet</p>
                  <p className="text-sm mt-1">Add a bank account to receive payouts</p>
                </div>
              )}

              {bankAccounts.map((acc) => (
                <div key={acc.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">
                        {acc.bankName?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{acc.bankName}</p>
                        {acc.isDefault && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {acc.accountNumber} • {acc.accountName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBankAccount(acc.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {showAddBank ? (
                <form onSubmit={handleAddBankAccount} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                    <div className="relative">
                      <select
                        value={bankForm.bankCode}
                        onChange={handleBankChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none"
                        required
                        disabled={banksLoading}
                      >
                        <option value="">
                          {banksLoading ? 'Loading banks...' : 'Select bank...'}
                        </option>
                        {bankList.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                      {banksLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankForm.accountNumber}
                        onChange={handleAccountNumberChange}
                        className={`w-full px-4 py-3 border rounded-lg pr-10 ${
                          verificationError ? 'border-red-300' : accountVerified ? 'border-green-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter 10-digit account number"
                        maxLength={10}
                        required
                      />
                      {verifyingAccount && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                      )}
                      {accountVerified && !verifyingAccount && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                      {verificationError && !verifyingAccount && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {verificationError && (
                      <p className="text-sm text-red-500 mt-1">{verificationError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankForm.accountName}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-50 ${
                          accountVerified ? 'border-green-300 text-gray-900' : 'border-gray-300 text-gray-500'
                        }`}
                        placeholder={verifyingAccount ? 'Verifying...' : 'Will be filled automatically'}
                        readOnly
                        required
                      />
                      {accountVerified && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {!accountVerified && bankForm.bankCode && bankForm.accountNumber.length < 10 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Enter 10 digits to auto-verify account
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBank(false);
                        setBankForm({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
                        setAccountVerified(false);
                        setVerificationError('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !accountVerified}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Account'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddBank(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-600 hover:text-green-600"
                >
                  + Add Bank Account
                </button>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">New Request Alerts</p>
                  <p className="text-sm text-gray-500">Get notified when brands send requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Payment Notifications</p>
                  <p className="text-sm text-gray-500">Get notified about payments and payouts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold text-red-500 mb-4">Danger Zone</h3>
        <button
          onClick={logout}
          className="text-red-500 border border-error px-4 py-2 rounded-lg hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
