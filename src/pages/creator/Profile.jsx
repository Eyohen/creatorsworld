import { useState, useEffect } from 'react';
import { creatorApi, lookupApi, uploadApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    gender: '',
    stateId: '',
    cityId: '',
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadProfile();
    loadStates();
  }, [authProfile]);

  const loadProfile = () => {
    if (authProfile) {
      setProfileData({
        displayName: authProfile.displayName || '',
        bio: authProfile.bio || '',
        gender: authProfile.gender || '',
        stateId: authProfile.stateId || '',
        cityId: authProfile.cityId || '',
      });
      if (authProfile.stateId) {
        loadCities(authProfile.stateId);
      }
    }
  };

  const loadStates = async () => {
    try {
      const { data } = await lookupApi.getStates();
      setStates(data.data || []);
    } catch (err) {
      console.error('Failed to load states:', err);
    }
  };

  const loadCities = async (stateId) => {
    try {
      const { data } = await lookupApi.getCities(stateId);
      setCities(data.data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  const handleStateChange = (stateId) => {
    setProfileData({ ...profileData, stateId, cityId: '' });
    if (stateId) loadCities(stateId);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await uploadApi.uploadImage(file);
      await creatorApi.updateProfile({ profileImage: data.data.url });
      await refreshProfile();
      setSuccess('Profile photo updated!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await uploadApi.uploadImage(file);
      await creatorApi.updateProfile({ coverImage: data.data.url });
      await refreshProfile();
      setSuccess('Cover image updated!');
    } catch (err) {
      console.error('Cover upload error:', err);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await creatorApi.updateProfile(profileData);
      await refreshProfile();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-semibold text-3xl text-gray-900">Edit Profile</h1>

      {/* Cover & Avatar */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="relative h-48 bg-gray-200">
          {authProfile?.coverImage && (
            <img src={authProfile.coverImage} alt="" className="w-full h-full object-cover" />
          )}
          <label className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            Change Cover
          </label>
        </div>
        <div className="px-8 pb-6">
          <div className="flex items-end -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
                {authProfile?.profileImage ? (
                  <img src={authProfile.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                    {profileData.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            <div className="ml-6 pb-2">
              <span className={`text-sm px-3 py-1 rounded-full ${
                authProfile?.tier === 'elite' ? 'bg-purple-100 text-purple-600' :
                authProfile?.tier === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                authProfile?.tier === 'verified' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {authProfile?.tier || 'Rising'} Creator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow p-8">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={profileData.stateId}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select state...</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={profileData.cityId}
                onChange={(e) => setProfileData({ ...profileData, cityId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!profileData.stateId}
              >
                <option value="">Select city...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
