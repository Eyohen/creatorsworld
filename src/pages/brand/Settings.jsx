import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, brandApi, uploadApi } from '../../api';

const Settings = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Company settings
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    website: '',
    description: '',
  });

  // Account settings (contact person)
  const [accountForm, setAccountForm] = useState({
    contactFirstName: '',
    contactLastName: '',
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user && profile) {
      setAccountForm({
        contactFirstName: profile.contactFirstName || '',
        contactLastName: profile.contactLastName || '',
      });
      setCompanyForm({
        companyName: profile.companyName || '',
        website: profile.website || '',
        description: profile.description || '',
      });
    }
  }, [user, profile]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data } = await uploadApi.uploadImage(file, 'logo');
      await brandApi.updateProfile({ logoUrl: data.data.url });
      await refreshProfile();
      setSuccess('Logo updated!');
    } catch (err) {
      setError('Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await brandApi.updateProfile(companyForm);
      await refreshProfile();
      setSuccess('Company info updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await brandApi.updateProfile(accountForm);
      await refreshProfile();
      setSuccess('Account updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
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
      setSuccess('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'account', label: 'Account' },
    { id: 'password', label: 'Password' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-semibold text-3xl text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="border-b border-gray-100 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
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

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile?.logo ? (
                    <img src={profile.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-3xl">{companyForm.companyName?.[0]}</span>
                  )}
                </div>
                <div>
                  <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-700">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    Upload Logo
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Recommended: 200x200px</p>
                </div>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">Contact person details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={accountForm.contactFirstName}
                    onChange={(e) => setAccountForm({ ...accountForm, contactFirstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Contact first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={accountForm.contactLastName}
                    onChange={(e) => setAccountForm({ ...accountForm, contactLastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Contact last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
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
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="bg-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-xl text-gray-900">
                    {profile?.tier === 'starter' ? 'Starter' :
                     profile?.tier === 'growth' ? 'Growth' :
                     profile?.tier === 'business' ? 'Business' : 'Enterprise'} Plan
                  </h3>
                  <span className="text-blue-600 font-semibold">
                    {profile?.tier === 'starter' ? 'Free' :
                     profile?.tier === 'growth' ? '₦15,000/mo' :
                     profile?.tier === 'business' ? '₦45,000/mo' : 'Custom'}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {profile?.tier === 'starter' && (
                    <>
                      <li>• 10 messages per month</li>
                      <li>• 1 active campaign</li>
                      <li>• 15% platform fee</li>
                    </>
                  )}
                  {profile?.tier === 'growth' && (
                    <>
                      <li>• 50 messages per month</li>
                      <li>• 5 active campaigns</li>
                      <li>• 12% platform fee</li>
                    </>
                  )}
                  {profile?.tier === 'business' && (
                    <>
                      <li>• 200 messages per month</li>
                      <li>• 20 active campaigns</li>
                      <li>• 10% platform fee</li>
                    </>
                  )}
                  {profile?.tier === 'enterprise' && (
                    <>
                      <li>• Unlimited messages</li>
                      <li>• Unlimited campaigns</li>
                      <li>• Custom platform fee</li>
                    </>
                  )}
                </ul>
              </div>

              {profile?.tier !== 'enterprise' && (
                <div className="grid md:grid-cols-3 gap-4">
                  {profile?.tier === 'starter' && (
                    <div className="border-2 border-blue-600 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900">Growth</h4>
                      <p className="text-xl font-semibold text-blue-600 my-2">₦15,000/mo</p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        <li>50 messages/mo</li>
                        <li>5 campaigns</li>
                        <li>12% fee</li>
                      </ul>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                        Upgrade
                      </button>
                    </div>
                  )}
                  {(profile?.tier === 'starter' || profile?.tier === 'growth') && (
                    <div className="border-2 border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900">Business</h4>
                      <p className="text-xl font-semibold text-gray-900 my-2">₦45,000/mo</p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        <li>200 messages/mo</li>
                        <li>20 campaigns</li>
                        <li>10% fee</li>
                      </ul>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50">
                        Upgrade
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900">Enterprise</h4>
                    <p className="text-xl font-semibold text-gray-900 my-2">Custom</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>Unlimited everything</li>
                      <li>Dedicated support</li>
                      <li>Custom terms</li>
                    </ul>
                    <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50">
                      Contact Sales
                    </button>
                  </div>
                </div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Request Updates</p>
                  <p className="text-sm text-gray-500">Get notified when creators respond</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">New Creator Recommendations</p>
                  <p className="text-sm text-gray-500">Weekly digest of matching creators</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
