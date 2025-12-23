import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorApi, lookupApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  User, Share2, Tag, CreditCard, Building2, Check, ChevronRight,
  Instagram, Youtube, Twitter, Plus, Trash2, Sparkles, ArrowRight,
  MapPin, Calendar, AlertCircle
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself', icon: User },
  { id: 2, title: 'Social Accounts', description: 'Connect your platforms', icon: Share2 },
  { id: 3, title: 'Niche Selection', description: 'Choose your categories', icon: Tag },
  { id: 4, title: 'Rate Card', description: 'Set your pricing', icon: CreditCard },
  { id: 5, title: 'Bank Details', description: 'For payouts', icon: Building2 },
];

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
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

  // Load states on mount
  useEffect(() => {
    loadStates();
  }, []);

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
          await creatorApi.saveOnboardingStep(1, basicInfo);
          break;
        case 2:
          await creatorApi.saveOnboardingStep(2, { socialAccounts });
          break;
        case 3:
          await creatorApi.saveOnboardingStep(3, { categoryIds: selectedCategories });
          break;
        case 4:
          await creatorApi.saveOnboardingStep(4, { rateCards });
          break;
        case 5:
          await creatorApi.saveOnboardingStep(5, { bankDetails });
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

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: Instagram,
      youtube: Youtube,
      twitter: Twitter,
      tiktok: Share2,
    };
    return icons[platform] || Share2;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={basicInfo.firstName}
                  onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={basicInfo.lastName}
                  onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input
                type="text"
                value={basicInfo.displayName}
                onChange={(e) => setBasicInfo({ ...basicInfo, displayName: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="How should brands see you? (e.g., @johncreates)"
              />
              <p className="mt-1.5 text-xs text-gray-500">This is the name brands will see on your profile</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                rows={4}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
              />
              <p className="mt-1.5 text-xs text-gray-500">{basicInfo.bio.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    Date of Birth
                  </span>
                </label>
                <input
                  type="date"
                  value={basicInfo.dateOfBirth}
                  onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    State *
                  </span>
                </label>
                <select
                  value={basicInfo.stateId}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-800 text-sm">
                Connect your social media accounts to showcase your reach and engagement to brands.
              </p>
            </div>

            <div className="space-y-4">
              {['instagram', 'tiktok', 'youtube', 'twitter'].map((platform) => {
                const PlatformIcon = getPlatformIcon(platform);
                const isConnected = socialAccounts.find(a => a.platform === platform);

                return (
                  <div
                    key={platform}
                    className={`border-2 rounded-2xl p-5 transition-all ${
                      isConnected ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isConnected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <PlatformIcon size={20} />
                        </div>
                        <span className="font-medium capitalize text-gray-900">{platform}</span>
                      </div>
                      <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                          isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={() => {
                          if (!isConnected) {
                            setSocialAccounts([...socialAccounts, { platform, username: '', followers: '' }]);
                          }
                        }}
                      >
                        {isConnected ? (
                          <span className="flex items-center gap-1">
                            <Check size={14} />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Plus size={14} />
                            Connect
                          </span>
                        )}
                      </button>
                    </div>

                    {isConnected && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                          <input
                            type="text"
                            placeholder="@username"
                            value={socialAccounts.find(a => a.platform === platform)?.username || ''}
                            onChange={(e) => {
                              const updated = socialAccounts.map(a =>
                                a.platform === platform ? { ...a, username: e.target.value } : a
                              );
                              setSocialAccounts(updated);
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Followers</label>
                          <input
                            type="number"
                            placeholder="e.g., 10000"
                            value={socialAccounts.find(a => a.platform === platform)?.followers || ''}
                            onChange={(e) => {
                              const updated = socialAccounts.map(a =>
                                a.platform === platform ? { ...a, followers: e.target.value } : a
                              );
                              setSocialAccounts(updated);
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-800 text-sm">
                Select up to 5 categories that best describe your content. This helps brands find you for relevant campaigns.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    disabled={!isSelected && selectedCategories.length >= 5}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : selectedCategories.length >= 5
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Selected categories</span>
              <span className={`text-sm font-semibold ${
                selectedCategories.length >= 5 ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {selectedCategories.length}/5
              </span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-800 text-sm">
                Set your base rates for different content types. You can always add more or adjust these later from your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              {rateCards.map((card, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900">Service {index + 1}</span>
                    {rateCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRateCard(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Platform</label>
                      <select
                        value={card.platform}
                        onChange={(e) => updateRateCard(index, 'platform', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter/X</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Content Type</label>
                      <select
                        value={card.contentType}
                        onChange={(e) => updateRateCard(index, 'contentType', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Price (₦)</label>
                      <input
                        type="number"
                        value={card.priceMin}
                        onChange={(e) => updateRateCard(index, 'priceMin', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="10,000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Price (₦)</label>
                      <input
                        type="number"
                        value={card.priceMax}
                        onChange={(e) => updateRateCard(index, 'priceMax', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="50,000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRateCard}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Another Service
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-800 text-sm">
                Add your bank details for receiving payouts. This information is securely encrypted and stored.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <select
                value={bankDetails.bankCode}
                onChange={(e) => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="Your full name as it appears on the account"
              />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-medium">Optional Step</p>
                <p className="text-amber-700 text-sm mt-1">
                  You can skip this step and add bank details later from your settings. However, you won't be able to request payouts until bank details are added.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
          <Sparkles size={16} />
          Creator Onboarding
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600">Let's set up your creator profile to start connecting with brands</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check size={20} />
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
                <div className="absolute top-14 text-center w-24">
                  <p className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Title */}
      <div className="text-center mb-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-500 mt-1">{steps[currentStep - 1].description}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
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
            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : currentStep === 5 ? (
              <>
                Complete Setup
                <Sparkles size={18} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Counter */}
      <div className="text-center mt-6">
        <span className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </span>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
