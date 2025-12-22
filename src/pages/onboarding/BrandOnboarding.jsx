import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandApi, lookupApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { id: 1, title: 'Company Info', description: 'Tell us about your business' },
  { id: 2, title: 'Contact Person', description: 'Who should creators contact?' },
  { id: 3, title: 'Preferences', description: 'What are you looking for?' },
  { id: 4, title: 'Verification', description: 'Optional business verification' },
];

const BrandOnboarding = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Company Info
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    industryId: '',
    companySize: '',
    website: '',
    description: '',
    stateId: '',
    cityId: '',
  });

  // Step 2: Contact Info
  const [contactInfo, setContactInfo] = useState({
    contactName: '',
    contactTitle: '',
    contactPhone: '',
  });

  // Step 3: Preferences
  const [preferences, setPreferences] = useState({
    budgetMin: '',
    budgetMax: '',
    preferredCategories: [],
  });

  // Step 4: Verification (optional)
  const [verification, setVerification] = useState({
    cacNumber: '',
    skipVerification: false,
  });

  // Lookup data
  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [industriesRes, statesRes] = await Promise.all([
        lookupApi.getIndustries(),
        lookupApi.getStates(),
      ]);
      setIndustries(industriesRes.data.data || []);
      setStates(statesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
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
    setCompanyInfo({ ...companyInfo, stateId, cityId: '' });
    if (stateId) loadCities(stateId);
  };

  const toggleCategory = (categoryId) => {
    const current = preferences.preferredCategories;
    if (current.includes(categoryId)) {
      setPreferences({
        ...preferences,
        preferredCategories: current.filter(id => id !== categoryId)
      });
    } else {
      setPreferences({
        ...preferences,
        preferredCategories: [...current, categoryId]
      });
    }
  };

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');

    try {
      switch (currentStep) {
        case 1:
          await brandApi.saveOnboardingStep(1, companyInfo);
          break;
        case 2:
          await brandApi.saveOnboardingStep(2, contactInfo);
          loadCategories();
          break;
        case 3:
          await brandApi.saveOnboardingStep(3, preferences);
          break;
        case 4:
          if (!verification.skipVerification && verification.cacNumber) {
            await brandApi.saveOnboardingStep(4, { cacNumber: verification.cacNumber });
          }
          await brandApi.completeOnboarding();
          await refreshProfile();
          navigate('/brand/dashboard');
          return;
      }

      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your company or brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
              <select
                value={companyInfo.industryId}
                onChange={(e) => setCompanyInfo({ ...companyInfo, industryId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry...</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select
                value={companyInfo.companySize}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companySize: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Your Company</label>
              <textarea
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description of your company and what you do..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={companyInfo.stateId}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  value={companyInfo.cityId}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, cityId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!companyInfo.stateId}
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
            <p className="text-gray-600">Who should creators contact for collaboration inquiries?</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
              <input
                type="text"
                value={contactInfo.contactName}
                onChange={(e) => setContactInfo({ ...contactInfo, contactName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={contactInfo.contactTitle}
                onChange={(e) => setContactInfo({ ...contactInfo, contactTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Marketing Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={contactInfo.contactPhone}
                onChange={(e) => setContactInfo({ ...contactInfo, contactPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Help us understand your influencer marketing needs.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={preferences.budgetMin}
                    onChange={(e) => setPreferences({ ...preferences, budgetMin: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Min (₦)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={preferences.budgetMax}
                    onChange={(e) => setPreferences({ ...preferences, budgetMax: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Max (₦)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Preferred Creator Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-lg border-2 text-left text-sm transition-colors ${
                      preferences.preferredCategories.includes(category.id)
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Business Verification (Optional)</h3>
              <p className="text-sm text-gray-700">
                Verified brands get a badge and increased trust with creators.
                You can skip this step and verify later.
              </p>
            </div>

            {!verification.skipVerification && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAC Registration Number
                </label>
                <input
                  type="text"
                  value={verification.cacNumber}
                  onChange={(e) => setVerification({ ...verification, cacNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your CAC number"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Corporate Affairs Commission registration number
                </p>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={verification.skipVerification}
                onChange={(e) => setVerification({ ...verification, skipVerification: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Skip verification for now</span>
            </label>
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
                  ? 'bg-blue-600 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-600 text-white'
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
                <div className={`w-16 md:w-28 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
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
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : currentStep === 4 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandOnboarding;
