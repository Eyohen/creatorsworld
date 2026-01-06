import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { creatorApi, lookupApi, brandApi, requestApi } from '../../api';
import {
  Search, Heart, MapPin, Star, Users,
  X, SlidersHorizontal, Grid3X3, List, Loader2, Sparkles,
  Award, TrendingUp, ChevronLeft, ChevronRight, CheckCircle2,
  Mail, Calendar, Clock, DollarSign, Briefcase, ExternalLink,
  Play, Image as ImageIcon, Globe, Send, AlertCircle, CheckCircle,
  FileText, ArrowLeft, Ban
} from 'lucide-react';

// Helper to check if creator is suspended
const isCreatorSuspended = (creator) => {
  if (!creator?.suspendedUntil) return false;
  return new Date(creator.suspendedUntil) > new Date();
};

// Suspension countdown component
const SuspensionBadge = ({ suspendedUntil, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(suspendedUntil).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        return 'Ended';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      return `${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [suspendedUntil]);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        <Ban className="w-3 h-3" />
        <span>Suspended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
      <Ban className="w-5 h-5 text-red-500" />
      <div>
        <p className="text-sm font-medium text-red-700">Creator Suspended</p>
        <p className="text-xs text-red-600">Available in {timeLeft}</p>
      </div>
    </div>
  );
};

const Discover = () => {
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Modal state
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [creatorDetails, setCreatorDetails] = useState(null);

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestCreator, setRequestCreator] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const [filters, setFilters] = useState({
    category: '',
    state: '',
    platform: '',
    minFollowers: '',
    maxFollowers: '',
    minPrice: '',
    maxPrice: '',
    verified: '',
    sort: 'relevance',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    loadFilters();
    loadSavedCreators();
  }, []);

  useEffect(() => {
    loadCreators();
  }, [filters, pagination.page, searchQuery]);

  // Load creator details when modal opens
  useEffect(() => {
    if (selectedCreator) {
      loadCreatorDetails(selectedCreator.id);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCreator]);

  const loadFilters = async () => {
    try {
      const [categoriesRes, statesRes] = await Promise.all([
        lookupApi.getCategories(),
        lookupApi.getStates(),
      ]);
      setCategories(categoriesRes.data.data || []);
      setStates(statesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const loadSavedCreators = async () => {
    try {
      const { data } = await brandApi.getSavedCreators();
      const ids = new Set((data.data || []).map(s => s.creatorId));
      setSavedIds(ids);
    } catch (err) {
      console.error('Failed to load saved creators:', err);
    }
  };

  const loadCreators = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        q: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
      };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const { data } = await creatorApi.search(params);
      setCreators(data.data.creators || []);
      setPagination(prev => ({ ...prev, total: data.data.pagination?.total || 0 }));
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCreatorDetails = async (creatorId) => {
    setModalLoading(true);
    try {
      const [profileRes, portfolioRes, rateCardsRes, availabilityRes] = await Promise.all([
        creatorApi.getById(creatorId),
        creatorApi.getPortfolio(creatorId),
        creatorApi.getRateCards(creatorId),
        creatorApi.getAvailability(creatorId),
      ]);
      setCreatorDetails({
        ...profileRes.data.data,
        portfolio: portfolioRes.data.data || [],
        rateCards: rateCardsRes.data.data || [],
        availability: availabilityRes.data.data || {},
      });
    } catch (err) {
      console.error('Failed to load creator details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      state: '',
      platform: '',
      minFollowers: '',
      maxFollowers: '',
      minPrice: '',
      maxPrice: '',
      verified: '',
      sort: 'relevance',
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSaveCreator = async (e, creatorId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (savedIds.has(creatorId)) {
        await brandApi.unsaveCreator(creatorId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(creatorId);
          return next;
        });
      } else {
        await brandApi.saveCreator(creatorId);
        setSavedIds(prev => new Set(prev).add(creatorId));
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const openCreatorModal = (creator, index) => {
    setSelectedCreator({ ...creator, index });
  };

  const closeModal = () => {
    setSelectedCreator(null);
    setCreatorDetails(null);
  };

  const openRequestModal = (creator, details) => {
    setRequestCreator({ ...creator, ...details });
    setShowRequestModal(true);
    setRequestSuccess(false);
    setRequestError('');
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestCreator(null);
    setRequestSuccess(false);
    setRequestError('');
  };

  const handleSendRequest = async (formData) => {
    setRequestSubmitting(true);
    setRequestError('');
    try {
      await requestApi.create({
        creatorId: requestCreator.id,
        campaignTitle: formData.campaignTitle,
        campaignBrief: formData.campaignBrief,
        requirements: formData.requirements,
        budgetAmount: parseInt(formData.budgetAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        selectedServices: formData.selectedServices,
      });
      setRequestSuccess(true);
    } catch (err) {
      console.error('Failed to send request:', err);
      const errorMsg = err.response?.data?.errors?.[0]?.message ||
                       err.response?.data?.message ||
                       'Failed to send request. Please try again.';
      setRequestError(errorMsg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'relevance').length;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'elite': return Sparkles;
      case 'premium': return Award;
      case 'verified': return Star;
      default: return TrendingUp;
    }
  };

  const getTierStyle = (tier) => {
    switch (tier) {
      case 'elite': return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      case 'premium': return 'bg-purple-100 text-purple-600';
      case 'verified': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Fallback images for creators without profile images
  const getCreatorImage = (creator, index) => {
    if (creator.profileImage && !creator.profileImage.includes('ui-avatars.com')) {
      return creator.profileImage;
    }
    const fallbackImages = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Discover Creators</h1>
              <p className="text-gray-400">Find the perfect creators for your brand campaigns</p>
            </div>
            <Link
              to="/brand/saved"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
            >
              <Heart className="w-5 h-5" />
              Saved ({savedIds.size})
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by name, niche, or keywords..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>

            <select
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter/X</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="followers">Most Followers</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-white text-blue-600 rounded-full text-xs flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}

            <div className="hidden md:flex items-center border-l border-gray-200 pl-2 ml-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min ₦"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max ₦"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minFollowers}
                    onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxFollowers}
                    onChange={(e) => handleFilterChange('maxFollowers', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                <select
                  value={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Creators</option>
                  <option value="true">Verified Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">Finding amazing creators...</p>
        </div>
      ) : creators.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No creators found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{creators.length}</span> of{' '}
              <span className="font-medium text-gray-900">{pagination.total}</span> creators
            </p>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator, index) => (
                <div
                  key={creator.id}
                  onClick={() => openCreatorModal(creator, index)}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Cover Image */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {creator.coverImage && (
                      <img
                        src={creator.coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <button
                      onClick={(e) => toggleSaveCreator(e, creator.id)}
                      className={`absolute top-3 right-3 p-2.5 rounded-xl transition-all ${
                        savedIds.has(creator.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${savedIds.has(creator.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Tier Badge */}
                    {creator.tier && creator.tier !== 'rising' && (
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTierStyle(creator.tier)}`}>
                        {(() => {
                          const TierIcon = getTierIcon(creator.tier);
                          return <TierIcon className="w-3 h-3" />;
                        })()}
                        {creator.tier}
                      </div>
                    )}

                    {/* Suspension Badge */}
                    {isCreatorSuspended(creator) && (
                      <div className="absolute top-3 left-3">
                        <SuspensionBadge suspendedUntil={creator.suspendedUntil} compact />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 -mt-12 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={getCreatorImage(creator, index)}
                          alt={creator.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{creator.displayName}</h3>
                          {creator.verificationStatus === 'verified' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{creator.state?.name || 'Nigeria'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">{creator.bio || 'Creative content creator ready to collaborate with brands.'}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{(creator.totalFollowers || Math.floor(Math.random() * 50000) + 5000).toLocaleString()}</span>
                      </div>
                      {parseFloat(creator.averageRating) > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{parseFloat(creator.averageRating).toFixed(1)}</span>
                        </div>
                      )}
                      {creator.minimumBudget && (
                        <div className="ml-auto text-blue-600 font-semibold text-sm">
                          From ₦{parseFloat(creator.minimumBudget).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {creators.map((creator, index) => (
                <div
                  key={creator.id}
                  onClick={() => openCreatorModal(creator, index)}
                  className="group flex items-center gap-6 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 overflow-hidden">
                    <img
                      src={getCreatorImage(creator, index)}
                      alt={creator.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{creator.displayName}</h3>
                      {creator.verificationStatus === 'verified' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                      {creator.tier && creator.tier !== 'rising' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierStyle(creator.tier)}`}>
                          {creator.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{creator.state?.name || 'Nigeria'}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{creator.bio || 'Creative content creator ready to collaborate with brands.'}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{(creator.totalFollowers || Math.floor(Math.random() * 50000) + 5000).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    {parseFloat(creator.averageRating) > 0 && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {parseFloat(creator.averageRating).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                    )}
                    {creator.minimumBudget && (
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">₦{parseFloat(creator.minimumBudget).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Starting</p>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => toggleSaveCreator(e, creator.id)}
                    className={`p-3 rounded-xl transition-all ${
                      savedIds.has(creator.id)
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${savedIds.has(creator.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= totalPages}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Creator Profile Modal */}
      {selectedCreator && (
        <CreatorProfileModal
          creator={selectedCreator}
          creatorDetails={creatorDetails}
          loading={modalLoading}
          onClose={closeModal}
          getCreatorImage={getCreatorImage}
          getTierIcon={getTierIcon}
          getTierStyle={getTierStyle}
          isSaved={savedIds.has(selectedCreator.id)}
          onToggleSave={(e) => toggleSaveCreator(e, selectedCreator.id)}
          onSendRequest={() => {
            openRequestModal(selectedCreator, creatorDetails);
            closeModal();
          }}
        />
      )}

      {/* Send Request Modal */}
      {showRequestModal && requestCreator && (
        <SendRequestModal
          creator={requestCreator}
          onClose={closeRequestModal}
          onSubmit={handleSendRequest}
          submitting={requestSubmitting}
          success={requestSuccess}
          error={requestError}
          getCreatorImage={getCreatorImage}
        />
      )}
    </div>
  );
};

// Creator Profile Modal Component
const CreatorProfileModal = ({
  creator,
  creatorDetails,
  loading,
  onClose,
  getCreatorImage,
  getTierIcon,
  getTierStyle,
  isSaved,
  onToggleSave,
  onSendRequest
}) => {
  const [activeTab, setActiveTab] = useState('about');
  const TierIcon = getTierIcon(creator.tier);

  const data = creatorDetails || creator;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-gray-900 hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-500">Loading creator profile...</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header Section */}
            <div className="relative">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                {data.coverImage && (
                  <img src={data.coverImage} alt="" className="w-full h-full object-cover opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Profile Info */}
              <div className="px-8 pb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 relative z-10">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                    <img
                      src={getCreatorImage(creator, creator.index)}
                      alt={data.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{data.displayName}</h2>
                      {data.verificationStatus === 'verified' && (
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      )}
                      {data.tier && data.tier !== 'rising' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getTierStyle(data.tier)}`}>
                          <TierIcon className="w-4 h-4" />
                          {data.tier} Creator
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{data.state?.name || 'Nigeria'}</span>
                      </div>
                      {data.primaryNiche && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{data.primaryNiche.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Responds {data.responseTime?.replace('_', ' ') || 'within 48h'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onToggleSave}
                      className={`p-3 rounded-xl transition-all ${
                        isSaved
                          ? 'bg-red-100 text-red-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    {isCreatorSuspended(data) ? (
                      <div className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed">
                        <Ban className="w-5 h-5" />
                        Suspended
                      </div>
                    ) : (
                      <button
                        onClick={onSendRequest}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        Send Request
                      </button>
                    )}
                  </div>
                </div>

                {/* Suspension Banner */}
                {isCreatorSuspended(data) && (
                  <div className="mt-4">
                    <SuspensionBadge suspendedUntil={data.suspendedUntil} />
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {(data.totalFollowers || Math.floor(Math.random() * 50000) + 5000).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      {parseFloat(data.averageRating || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">{data.totalReviews || 0} Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{data.completedCollaborations || 0}</p>
                    <p className="text-sm text-gray-500">Collaborations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ₦{parseFloat(data.minimumBudget || 50000).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Starting Price</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-8 border-b border-gray-100">
              <div className="flex gap-6">
                {['about', 'portfolio', 'services', 'availability'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                      activeTab === tab
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {data.bio || 'This creator hasn\'t added a bio yet. Send them a request to learn more about their services!'}
                    </p>
                  </div>

                  {/* Social Accounts */}
                  {data.socialAccounts && data.socialAccounts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Social Media</h3>
                      <div className="flex flex-wrap gap-3">
                        {data.socialAccounts.map((account, idx) => (
                          <a
                            key={idx}
                            href={account.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                          >
                            <Globe className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700 capitalize">{account.platform}</span>
                            <span className="text-sm text-gray-500">
                              {account.followerCount?.toLocaleString() || '—'} followers
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {data.languages && data.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.languages.map((lang, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div>
                  {data.portfolio && data.portfolio.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {data.portfolio.map((item, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                          {item.mediaType === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          ) : (
                            <img
                              src={item.mediaUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white font-medium truncate">{item.title}</p>
                              {item.platform && (
                                <p className="text-white/70 text-sm capitalize">{item.platform}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No portfolio items yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'services' && (
                <div>
                  {data.rateCards && data.rateCards.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.rateCards.map((card, idx) => (
                        <div key={idx} className="p-5 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 capitalize">{card.contentType?.replace('_', ' ')}</h4>
                              <p className="text-sm text-gray-500 capitalize">{card.platform}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">
                                ₦{parseFloat(card.basePrice || 0).toLocaleString()}
                                {card.maxPrice && (
                                  <span className="text-gray-400 font-normal text-sm"> - ₦{parseFloat(card.maxPrice).toLocaleString()}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          {card.description && (
                            <p className="text-sm text-gray-600">{card.description}</p>
                          )}
                          {card.deliveryDays && (
                            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{card.deliveryDays} days delivery</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No rate cards available</p>
                      <p className="text-sm text-gray-400 mt-1">Send a request to discuss pricing</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'availability' && (
                <AvailabilityCalendar availability={data.availability} creatorName={data.displayName} />
              )}
            </div>

            {/* Footer CTA */}
            <div className="sticky bottom-0 p-6 bg-white border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ready to collaborate?</p>
                  <p className="font-semibold text-gray-900">Send a collaboration request to {data.displayName}</p>
                </div>
                <button
                  onClick={onSendRequest}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Send Request Modal Component
const SendRequestModal = ({
  creator,
  onClose,
  onSubmit,
  submitting,
  success,
  error,
  getCreatorImage
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campaignTitle: '',
    campaignBrief: '',
    requirements: '',
    budgetAmount: '',
    startDate: '',
    endDate: '',
    selectedServices: [],
  });
  const [dateConflict, setDateConflict] = useState(null);

  // Get availability data
  const availability = creator.availability || {};
  const { isAvailable = true, leadTimeDays = 0, blockedSlots = [] } = availability;

  // Check if selected dates conflict with blocked dates
  const checkDateConflicts = (start, end) => {
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Check lead time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minStartDate = new Date(today);
    minStartDate.setDate(minStartDate.getDate() + leadTimeDays);

    if (startDate < minStartDate) {
      return {
        type: 'leadtime',
        message: `${creator.displayName} requires at least ${leadTimeDays} days notice. Please select a start date after ${minStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
      };
    }

    // Check for conflicts with blocked dates
    for (const slot of blockedSlots) {
      const blockedStart = new Date(slot.startDate);
      const blockedEnd = new Date(slot.endDate);
      blockedStart.setHours(0, 0, 0, 0);
      blockedEnd.setHours(0, 0, 0, 0);

      // Check if date ranges overlap
      if (startDate <= blockedEnd && endDate >= blockedStart) {
        return {
          type: 'blocked',
          message: `Your selected dates conflict with the creator's blocked period (${blockedStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${blockedEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}).`
        };
      }
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Check for date conflicts when dates change
    if (name === 'startDate' || name === 'endDate') {
      const conflict = checkDateConflicts(
        name === 'startDate' ? value : formData.startDate,
        name === 'endDate' ? value : formData.endDate
      );
      setDateConflict(conflict);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if there's a date conflict
    if (dateConflict) {
      return;
    }

    // Prevent submission if creator is unavailable
    if (!isAvailable) {
      return;
    }

    onSubmit(formData);
  };

  // Get minimum date (tomorrow at minimum, or lead time if set)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + Math.max(1, leadTimeDays));
  const minDateStr = minDate.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your collaboration request has been sent to {creator.displayName}. They will be notified and can respond to your request.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Continue Browsing
            </button>
            <button
              onClick={() => navigate('/brand/requests')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send Collaboration Request</h2>
                <p className="text-sm text-gray-500">to {creator.displayName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Creator Summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={getCreatorImage(creator, creator.index || 0)}
                  alt={creator.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{creator.displayName}</p>
                <p className="text-sm text-gray-500">{creator.primaryNiche?.name || 'Content Creator'}</p>
              </div>
              {creator.minimumBudget && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="font-semibold text-blue-600">₦{parseFloat(creator.minimumBudget).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Creator Unavailable Warning */}
            {!isAvailable && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Creator Unavailable</p>
                  <p className="text-sm">{creator.displayName} is not accepting new collaborations at this time.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Campaign Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                name="campaignTitle"
                value={formData.campaignTitle}
                onChange={handleChange}
                required
                placeholder="e.g., Product Launch Campaign"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campaign Brief */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Brief *
              </label>
              <textarea
                name="campaignBrief"
                value={formData.campaignBrief}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your campaign, brand, and what you're looking to achieve..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="Specific requirements, hashtags, mentions, dos and don'ts..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Select Services */}
            {creator.rateCards && creator.rateCards.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Services (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {creator.rateCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleServiceToggle(card.id)}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        formData.selectedServices.includes(card.id)
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize text-sm">
                            {card.contentType?.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{card.platform}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.selectedServices.includes(card.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.selectedServices.includes(card.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-blue-600 mt-2">
                        ₦{parseFloat(card.basePrice || 0).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₦) *
              </label>
              <input
                type="number"
                name="budgetAmount"
                value={formData.budgetAmount}
                onChange={handleChange}
                required
                min="5000"
                placeholder="50000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum budget: ₦5,000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  min={minDateStr}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    dateConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate || minDateStr}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    dateConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* Date Conflict Warning */}
            {dateConflict && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Date Conflict</p>
                  <p className="text-sm text-amber-700">{dateConflict.message}</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Check the creator's <span className="font-medium">Availability</span> tab to see their calendar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-6 bg-white border-t border-gray-100">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || dateConflict || !isAvailable}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : dateConflict ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Fix Date Conflict
                  </>
                ) : !isAvailable ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Creator Unavailable
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Availability Calendar Component for Brands to View Creator Availability
const AvailabilityCalendar = ({ availability, creatorName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get availability data with defaults
  const {
    isAvailable = true,
    leadTimeDays = 0,
    blockedSlots = []
  } = availability || {};

  // Calculate dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leadTimeDate = new Date(today);
  leadTimeDate.setDate(leadTimeDate.getDate() + leadTimeDays);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Padding for start of month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    if (!date) return false;

    return blockedSlots.some(slot => {
      const startDate = new Date(slot.startDate);
      const endDate = new Date(slot.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return date >= startDate && date <= endDate;
    });
  };

  // Check if date is in lead time period
  const isInLeadTime = (date) => {
    if (!date) return false;
    return date >= today && date < leadTimeDate;
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    if (!date) return false;
    return date < today;
  };

  // Get date status for styling
  const getDateStatus = (date) => {
    if (!date) return 'empty';
    if (isPastDate(date)) return 'past';
    if (isDateBlocked(date)) return 'blocked';
    if (isInLeadTime(date)) return 'leadtime';
    return 'available';
  };

  // Calculate available weeks in next 2 months
  const calculateAvailableWeeks = () => {
    const checkDate = new Date(today);
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

    let availableDays = 0;
    while (checkDate <= twoMonthsLater) {
      if (!isDateBlocked(checkDate) && !isInLeadTime(checkDate)) {
        availableDays++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    return Math.floor(availableDays / 7);
  };

  const availableWeeks = calculateAvailableWeeks();
  const hasEnoughAvailability = availableWeeks >= 2;

  const days = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Don't allow navigating to past months
  const canGoPrev = currentMonth > new Date(today.getFullYear(), today.getMonth(), 1);

  if (!isAvailable) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Currently Unavailable</h3>
        <p className="text-gray-500">
          {creatorName} is not accepting new collaborations at this time.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Check back later or save this creator to get notified when they're available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Availability Status Banner */}
      <div className={`p-4 rounded-2xl ${hasEnoughAvailability ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${hasEnoughAvailability ? 'bg-green-100' : 'bg-amber-100'}`}>
            {hasEnoughAvailability ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div>
            <h4 className={`font-semibold ${hasEnoughAvailability ? 'text-green-900' : 'text-amber-900'}`}>
              {hasEnoughAvailability
                ? `${availableWeeks} weeks available`
                : 'Limited availability'}
            </h4>
            <p className={`text-sm ${hasEnoughAvailability ? 'text-green-700' : 'text-amber-700'}`}>
              {hasEnoughAvailability
                ? `${creatorName} has good availability for new collaborations.`
                : `${creatorName} has less than 2 weeks available in the next 2 months.`}
            </p>
          </div>
        </div>
      </div>


      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            const status = getDateStatus(date);

            return (
              <div
                key={idx}
                className={`aspect-square p-1 border-b border-r border-gray-100 ${
                  idx % 7 === 0 ? 'border-l' : ''
                }`}
              >
                {date && (
                  <div
                    className={`w-full h-full flex items-center justify-center rounded-lg text-sm font-medium ${
                      status === 'available' ? 'text-green-700 bg-green-50' :
                      status === 'blocked' ? 'text-red-600 bg-red-50' :
                      status === 'leadtime' ? 'text-blue-600 bg-blue-50' :
                      status === 'past' ? 'text-gray-300' : ''
                    }`}
                  >
                    {date.getDate()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
          <span className="text-sm text-gray-600">Blocked/Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span className="text-sm text-gray-600">Past dates</span>
        </div>
      </div>

      {/* Upcoming Blocked Periods */}
      {blockedSlots.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Blocked Periods</h4>
          <div className="space-y-2">
            {blockedSlots
              .filter(slot => new Date(slot.endDate) >= today)
              .slice(0, 5)
              .map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    {new Date(slot.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' — '}
                    {new Date(slot.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {slot.reason && ` (${slot.reason})`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
