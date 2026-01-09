import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Users, Star, Verified, Heart, X, Instagram,
  Phone, ChevronDown, Grid3X3, LayoutList, TrendingUp, Filter
} from 'lucide-react';
import { creatorApi, lookupApi } from '../../api';

// ============== CREATOR PROFILE MODAL ==============
const CreatorProfileModal = ({ creator, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Portfolio');
  const [fullCreator, setFullCreator] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full creator profile when modal opens
  useEffect(() => {
    if (isOpen && creator?.id) {
      setLoading(true);
      creatorApi.getById(creator.id)
        .then(({ data }) => {
          setFullCreator(data.data);
        })
        .catch((err) => {
          console.error('Failed to load creator profile:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFullCreator(null);
    }
  }, [isOpen, creator?.id]);

  if (!isOpen || !creator) return null;

  // Use full creator data if available, otherwise fall back to search result
  const displayCreator = fullCreator || creator;
  const portfolio = displayCreator.portfolio || [];

  const stats = [
    { value: displayCreator.followersCount || formatFollowers(displayCreator.totalFollowers) || '10K', label: 'Followers' },
    { value: displayCreator.engagement || '8.5%', label: 'Engagement' },
    { value: displayCreator.campaignsCount || displayCreator.completedCollaborations || '0', label: 'Campaigns' },
    { value: displayCreator.completionRate || '95', label: 'Completion' },
  ];

  const reviews = displayCreator.reviewCount || displayCreator.totalReviews || 0;

  // Format categories from API
  const categories = displayCreator.categories?.map(c => c.name) ||
                     displayCreator.categoryNames ||
                     [displayCreator.tier ? `${displayCreator.tier} Creator` : 'Creator'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={displayCreator.coverImage || getCreatorImage(displayCreator)}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-192px)]">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4 -mt-12 mb-4">
              <div className="relative flex-shrink-0">
                <img
                  src={getCreatorImage(displayCreator)}
                  alt={displayCreator.displayName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              </div>

              <div className="flex-1 pt-14">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{displayCreator.displayName}</h2>
                      {displayCreator.isVerified && (
                        <Verified size={18} className="text-blue-600 fill-blue-100" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <MapPin size={14} />
                      <span>{displayCreator.state?.name || displayCreator.location || 'Nigeria'}</span>
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categories.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  {parseFloat(displayCreator.averageRating) > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={`${star <= Math.round(parseFloat(displayCreator.averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-gray-900 ml-1">{parseFloat(displayCreator.averageRating).toFixed(1)}</span>
                      <span className="text-gray-500">({reviews} Reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Instagram size={16} />
                View Instagram
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                <Phone size={16} />
                Contact for Campaign
              </button>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {displayCreator.bio || `Professional content creator helping brands connect with engaged Nigerian audiences. Specializing in authentic storytelling and high-quality content that drives real results.`}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('Portfolio')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'Portfolio'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('Reviews')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'Reviews'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Reviews ({reviews})
              </button>
            </div>

            {/* Portfolio Grid */}
            {activeTab === 'Portfolio' && (
              <div className="grid grid-cols-3 gap-3">
                {portfolio.length > 0 ? (
                  portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer"
                    >
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="font-semibold text-sm">{item.title}</p>
                        {item.brandName && <p className="text-xs text-gray-300">{item.brandName}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    No portfolio items yet
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'Reviews' && (
              <div className="space-y-4">
                {reviews > 0 ? (
                  [
                    { name: 'Sarah M.', company: 'TechBrand Nigeria', rating: 5, comment: 'Excellent work! Delivered on time and exceeded expectations.' },
                    { name: 'Chidi O.', company: 'Fashion Forward', rating: 5, comment: 'Very professional and creative. Would definitely work with again.' },
                    { name: 'Amaka E.', company: 'Food Connect', rating: 4, comment: 'Great communication throughout the campaign.' },
                  ].map((review, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                          <p className="text-xs text-gray-500">{review.company}</p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={`${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to format follower count
const formatFollowers = (count) => {
  if (!count) return null;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

// Fallback images for creators without profile images
const fallbackImages = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
];

// Get a consistent fallback image based on creator id or index
const getFallbackImage = (creatorId, index = 0) => {
  const hash = creatorId ? creatorId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : index;
  return fallbackImages[hash % fallbackImages.length];
};

// Check if the image is a valid real image (not a placeholder/avatar service)
const getCreatorImage = (creator, index = 0) => {
  const img = creator?.profileImage;
  // Check if image is empty, null, or a placeholder service URL
  if (!img ||
      img.trim() === '' ||
      img.toLowerCase().includes('ui-avatars') ||
      img.toLowerCase().includes('avatars') ||
      img.toLowerCase().includes('avatar') ||
      img.toLowerCase().includes('placeholder') ||
      img.toLowerCase().includes('gravatar') ||
      img.toLowerCase().includes('dicebear') ||
      img.toLowerCase().includes('robohash') ||
      img.toLowerCase().includes('identicon') ||
      img.startsWith('data:')) {
    return getFallbackImage(creator?.id, index);
  }
  return img;
};

// Helper function to format price range
const formatPriceRange = (creator) => {
  if (creator.minRate && creator.maxRate) {
    return `₦${(creator.minRate / 1000).toFixed(0)}K - ₦${(creator.maxRate / 1000).toFixed(0)}K`;
  }
  if (creator.startingPrice) {
    return `From ₦${(creator.startingPrice / 1000).toFixed(0)}K`;
  }
  return 'Contact for pricing';
};

// ============== MAIN BROWSE PAGE ==============
const BrowseCreatorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'relevance',
    tier: '',
    location: ''
  });

  const [activeCategory, setActiveCategory] = useState('All Creators');

  // Quick filter categories for tabs
  const quickCategories = ['All Creators', 'Fashion', 'Tech', 'Food', 'Lifestyle', 'Beauty', 'Travel', 'Entertainment'];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCreators();
  }, [filters, searchQuery]);

  const loadCategories = async () => {
    try {
      const { data } = await lookupApi.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadCreators = async () => {
    setLoading(true);
    try {
      let categoryId = filters.category;
      if (categoryId && !categoryId.match(/^[0-9a-f-]{36}$/i)) {
        const matchedCat = categories.find(
          c => c.slug === categoryId.toLowerCase() || c.name.toLowerCase() === categoryId.toLowerCase()
        );
        categoryId = matchedCat?.id || '';
      }

      const { data } = await creatorApi.search({
        ...filters,
        category: categoryId,
        search: searchQuery
      });
      setCreators(data.data.creators || []);
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === 'All Creators') {
      setFilters({ ...filters, category: '' });
      setSearchParams({});
    } else {
      const matchedCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      setFilters({ ...filters, category: matchedCat?.id || categoryName });
      setSearchParams({ category: categoryName.toLowerCase() });
    }
  };

  const openModal = (creator) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCreator(null);
    document.body.style.overflow = 'unset';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCreators();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Discover <span className="text-blue-600">Amazing Creators</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse through our diverse community of verified creators across multiple niches.
              Find the perfect match for your brand campaigns.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-full overflow-hidden focus-within:border-blue-600 transition-colors shadow-sm">
                <div className="pl-5">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search creators by name, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <span className="text-gray-600"><strong className="text-gray-900">5,000+</strong> Creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} className="text-blue-600 fill-blue-600" />
                <span className="text-gray-600"><strong className="text-gray-900">4.8</strong> Avg Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                <span className="text-gray-600"><strong className="text-gray-900">10K+</strong> Campaigns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {quickCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-sm font-thin rounded-full transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutList size={20} />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => {
                      setFilters({ ...filters, category: e.target.value });
                      const cat = categories.find(c => c.id === e.target.value);
                      setActiveCategory(cat?.name || 'All Creators');
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="followers">Most Followers</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creator Tier</label>
                <div className="relative">
                  <select
                    value={filters.tier}
                    onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    <option value="">All Tiers</option>
                    <option value="nano">Nano (1K-10K)</option>
                    <option value="micro">Micro (10K-50K)</option>
                    <option value="mid">Mid (50K-500K)</option>
                    <option value="macro">Macro (500K-1M)</option>
                    <option value="mega">Mega (1M+)</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    sort: 'relevance',
                    tier: '',
                    location: ''
                  });
                  setActiveCategory('All Creators');
                  setSearchParams({});
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `Found ${creators.length} creator${creators.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setFilters({
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  sort: 'relevance',
                  tier: '',
                  location: ''
                });
                setSearchQuery('');
                setActiveCategory('All Creators');
              }}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {creators.map((creator, index) => (
              <div
                key={creator.id}
                className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-64'}`}>
                  <img
                    src={getCreatorImage(creator, index)}
                    alt={creator.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {creator.tier && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1 capitalize">
                      <Star size={12} className="fill-current" /> {creator.tier}
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(creator.categories?.slice(0, 3) || [{ name: creator.tier || 'Creator' }]).map((cat, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {cat.name || cat}
                      </span>
                    ))}
                  </div>

                  {/* Location & Followers */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {creator.state?.name || 'Nigeria'}
                    </span>
                    {creator.totalFollowers && (
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {formatFollowers(creator.totalFollowers)}
                      </span>
                    )}
                  </div>

                  {/* Name & Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {creator.displayName}
                        {creator.isVerified && <Verified size={14} className="text-blue-600 fill-blue-100" />}
                      </h3>
                      <p className="text-sm text-gray-500">{formatPriceRange(creator)}</p>
                    </div>
                    {parseFloat(creator.averageRating) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {parseFloat(creator.averageRating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio Preview (List view only) */}
                  {viewMode === 'list' && creator.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{creator.bio}</p>
                  )}

                  {/* View Profile Button */}
                  <button
                    onClick={() => openModal(creator)}
                    className="w-full mt-3 px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {creators.length > 0 && (
          <div className="text-center mt-10">
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300">
              Load More Creators
            </button>
          </div>
        )}
      </section>

      {/* Profile Modal */}
      <CreatorProfileModal
        creator={selectedCreator}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default BrowseCreatorsPage;
