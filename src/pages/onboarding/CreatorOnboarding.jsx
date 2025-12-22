import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorApi, lookupApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Social Accounts', description: 'Connect your platforms' },
  { id: 3, title: 'Niche Selection', description: 'Choose your categories' },
  { id: 4, title: 'Rate Card', description: 'Set your pricing' },
  { id: 5, title: 'Bank Details', description: 'For payouts' },
];

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    displayName: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    stateId: '',
    cityId: '',
  });

  // Step 2: Social Accounts
  const [socialAccounts, setSocialAccounts] = useState([]);

  // Step 3: Categories
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  // Step 4: Rate Card
  const [rateCards, setRateCards] = useState([
    { platform: 'instagram', contentType: 'post', priceMin: '', priceMax: '' },
  ]);

  // Step 5: Bank Details
  const [bankDetails, setBankDetails] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
  });

  // Location data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Load data when needed
  const loadStates = async () => {
    if (states.length === 0) {
      try {
        const { data } = await lookupApi.getStates();
        setStates(data.data || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
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

  const loadCategories = async () => {
    if (categories.length === 0) {
      try {
        const { data } = await lookupApi.getCategories();
        setCategories(data.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
  };

  const handleStateChange = (stateId) => {
    setBasicInfo({ ...basicInfo, stateId, cityId: '' });
    if (stateId) loadCities(stateId);
  };

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');

    try {
      switch (currentStep) {
        case 1:
          await creatorApi.updateOnboarding({ step: 1, ...basicInfo });
          break;
        case 2:
          await creatorApi.updateOnboarding({ step: 2, socialAccounts });
          break;
        case 3:
          await creatorApi.updateOnboarding({ step: 3, categoryIds: selectedCategories });
          break;
        case 4:
          await creatorApi.updateOnboarding({ step: 4, rateCards });
          break;
        case 5:
          await creatorApi.updateOnboarding({ step: 5, bankDetails });
          await creatorApi.completeOnboarding();
          await refreshProfile();
          navigate('/creator/dashboard');
          return;
      }

      setCurrentStep(currentStep + 1);

      // Preload data for next step
      if (currentStep === 2) loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const addRateCard = () => {
    setRateCards([...rateCards, { platform: 'instagram', contentType: 'post', priceMin: '', priceMax: '' }]);
  };

  const removeRateCard = (index) => {
    setRateCards(rateCards.filter((_, i) => i !== index));
  };

  const updateRateCard = (index, field, value) => {
    const updated = [...rateCards];
    updated[index][field] = value;
    setRateCards(updated);
  };

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Load states when component mounts
  useState(() => {
    loadStates();
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input
                type="text"
                value={basicInfo.displayName}
                onChange={(e) => setBasicInfo({ ...basicInfo, displayName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="How should brands see you?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={basicInfo.dateOfBirth}
                  onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select
                  value={basicInfo.stateId}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  value={basicInfo.cityId}
                  onChange={(e) => setBasicInfo({ ...basicInfo, cityId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  disabled={!basicInfo.stateId}
                >
                  <option value="">Select city...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Connect your social media accounts to showcase your reach and engagement.</p>

            <div className="space-y-4">
              {['instagram', 'tiktok', 'youtube', 'twitter'].map((platform) => (
                <div key={platform} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium capitalize">{platform}</span>
                    <button
                      type="button"
                      className="text-green-600 text-sm hover:underline"
                      onClick={() => {
                        const existing = socialAccounts.find(a => a.platform === platform);
                        if (!existing) {
                          setSocialAccounts([...socialAccounts, { platform, username: '', followers: '' }]);
                        }
                      }}
                    >
                      {socialAccounts.find(a => a.platform === platform) ? 'Connected' : '+ Connect'}
                    </button>
                  </div>
                  {socialAccounts.find(a => a.platform === platform) && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Username"
                        value={socialAccounts.find(a => a.platform === platform)?.username || ''}
                        onChange={(e) => {
                          const updated = socialAccounts.map(a =>
                            a.platform === platform ? { ...a, username: e.target.value } : a
                          );
                          setSocialAccounts(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Followers"
                        value={socialAccounts.find(a => a.platform === platform)?.followers || ''}
                        onChange={(e) => {
                          const updated = socialAccounts.map(a =>
                            a.platform === platform ? { ...a, followers: e.target.value } : a
                          );
                          setSocialAccounts(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Select up to 5 categories that best describe your content. This helps brands find you.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'border-green-600 bg-green-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              Selected: {selectedCategories.length}/5
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Set your base rates for different content types. You can add more later.</p>

            {rateCards.map((card, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-medium">Service {index + 1}</span>
                  {rateCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRateCard(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Platform</label>
                    <select
                      value={card.platform}
                      onChange={(e) => updateRateCard(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter/X</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Content Type</label>
                    <select
                      value={card.contentType}
                      onChange={(e) => updateRateCard(index, 'contentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="post">Post</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel/Short</option>
                      <option value="video">Video</option>
                      <option value="live">Live Stream</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Price (₦)</label>
                    <input
                      type="number"
                      value={card.priceMin}
                      onChange={(e) => updateRateCard(index, 'priceMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price (₦)</label>
                    <input
                      type="number"
                      value={card.priceMax}
                      onChange={(e) => updateRateCard(index, 'priceMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRateCard}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-600 hover:text-green-600"
            >
              + Add Another Service
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Add your bank details for receiving payouts. This information is securely stored.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <select
                value={bankDetails.bankCode}
                onChange={(e) => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select your bank...</option>
                <option value="044">Access Bank</option>
                <option value="023">Citibank</option>
                <option value="050">Ecobank</option>
                <option value="070">Fidelity Bank</option>
                <option value="011">First Bank</option>
                <option value="214">FCMB</option>
                <option value="058">GTBank</option>
                <option value="030">Heritage Bank</option>
                <option value="301">Jaiz Bank</option>
                <option value="082">Keystone Bank</option>
                <option value="076">Polaris Bank</option>
                <option value="221">Stanbic IBTC</option>
                <option value="068">Standard Chartered</option>
                <option value="232">Sterling Bank</option>
                <option value="032">Union Bank</option>
                <option value="033">UBA</option>
                <option value="215">Unity Bank</option>
                <option value="035">Wema Bank</option>
                <option value="057">Zenith Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0123456789"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Your full name as it appears on the account"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You can skip this step and add bank details later from your settings.
                However, you won't be able to request payouts until bank details are added.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : currentStep === step.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-24 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="font-semibold text-2xl text-gray-900">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow p-8">
        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={handleSubmitStep}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : currentStep === 5 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
