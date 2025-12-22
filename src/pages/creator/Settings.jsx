import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, paymentApi } from '../../api';

const Settings = () => {
  const { user, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Account settings
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
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
  const [bankForm, setBankForm] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
    loadBankAccounts();
  }, [user]);

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
      await authApi.updateProfile(accountForm);
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={accountForm.firstName}
                    onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={accountForm.lastName}
                    onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{acc.bankName}</p>
                    <p className="text-sm text-gray-500">
                      {acc.accountNumber} • {acc.accountName}
                    </p>
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
                    <select
                      value={bankForm.bankCode}
                      onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select bank...</option>
                      <option value="044">Access Bank</option>
                      <option value="050">Ecobank</option>
                      <option value="070">Fidelity Bank</option>
                      <option value="011">First Bank</option>
                      <option value="214">FCMB</option>
                      <option value="058">GTBank</option>
                      <option value="082">Keystone Bank</option>
                      <option value="076">Polaris Bank</option>
                      <option value="221">Stanbic IBTC</option>
                      <option value="232">Sterling Bank</option>
                      <option value="032">Union Bank</option>
                      <option value="033">UBA</option>
                      <option value="035">Wema Bank</option>
                      <option value="057">Zenith Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={bankForm.accountName}
                      onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      Add Account
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
