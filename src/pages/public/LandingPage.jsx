import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Play, CheckCircle, Users, Star, TrendingUp,
  MapPin, Verified, Heart, Search, MessageSquare, BarChart3,
  FileCheck, Zap, Target, Plus, Minus, Quote, ChevronLeft,
  ChevronRight, X, Instagram, Phone
} from 'lucide-react';
import { creatorApi } from '../../api';

// Helper to get creator image
const getCreatorImage = (creator) => {
  return creator.profileImage || creator.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.displayName || creator.name || 'Creator')}&background=random&size=400`;
};

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

  // Use full creator data if available
  const displayCreator = fullCreator || creator;
  const portfolio = displayCreator.portfolio || [];

  const stats = [
    { value: displayCreator.followersCount || '0', label: 'Followers' },
    { value: displayCreator.engagement || '0%', label: 'Engagement' },
    { value: displayCreator.completedCollaborations || displayCreator.campaigns || '0', label: 'Campaigns' },
    { value: displayCreator.completionRate || displayCreator.completion || '0', label: 'Completion' },
  ];

  const reviews = displayCreator.totalReviews || displayCreator.reviewCount || 0;
  const displayCategories = displayCreator.categories?.map(c => typeof c === 'string' ? c : c.name) || displayCreator.categoryNames || [displayCreator.tier ? `${displayCreator.tier} Creator` : 'Creator'];
  const displayName = displayCreator.displayName || displayCreator.name || 'Creator';
  const displayLocation = displayCreator.state?.name ? `${displayCreator.city?.name || ''}, ${displayCreator.state?.name}`.replace(/^, /, '') : displayCreator.location || 'Nigeria';
  const displayImage = displayCreator.profileImage || displayCreator.image || getCreatorImage(displayCreator);
  const displayAbout = displayCreator.bio || displayCreator.about || `Professional creator helping brands connect with engaged Nigerian audiences.`;

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
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={displayImage}
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
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4 -mt-12 mb-4">
              <div className="relative flex-shrink-0">
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              </div>

              <div className="flex-1 pt-14">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                      {displayCreator.verified && (
                        <Verified size={18} className="text-blue-600 fill-blue-100" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <MapPin size={14} />
                      <span>{displayLocation}</span>
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {displayCategories.map((tag, index) => (
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
                  <div className="flex items-center gap-1 text-sm">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900 ml-1">4.9</span>
                    <span className="text-gray-500">({reviews} Reviews)</span>
                  </div>
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
                {displayAbout}
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
                {portfolio.length > 0 ? portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer"
                  >
                    <img
                      src={item.mediaUrl || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-gray-300">{item.brandName || item.client}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    No portfolio items yet
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'Reviews' && (
              <div className="space-y-4">
                {[
                  { name: 'Sarah M.', company: 'TechBrand Nigeria', rating: 5, comment: 'Excellent work! Delivered on time and exceeded expectations. The engagement on the content was amazing.' },
                  { name: 'Chidi O.', company: 'Fashion Forward', rating: 5, comment: 'Very professional and creative. Would definitely work with again.' },
                  { name: 'Amaka E.', company: 'Food Connect', rating: 4, comment: 'Great communication throughout the campaign. Quality content delivered.' },
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ============== HERO ==============
const Hero = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <span className="text-blue-600">●</span>
              Brand Portal/view creators
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Connect. <span className="text-blue-600">Collaborate.</span> Create Impact.
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A trusted platform that lets brands effortlessly find, vet, and collaborate with influencers and
            creators through budget-friendly option-menus, and traction-oriented marketing.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-300 to-gray-400"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                    backgroundSize: 'cover',
                  }}
                />
              ))}
            </div>
            <span className="ml-2 font-medium">Over 10,100+</span>
            <span className="text-gray-400">Influencers and creators worldwide</span>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 hover:shadow-lg gap-2 group"
          >
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Play size={12} className="ml-0.5" />
            </span>
            Search a perfect match
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ============== TOP CREATORS ==============
const TopCreators = () => {
  const creators = [
    { id: 1, name: 'Sam Morris', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', category: 'Fashion & Lifestyle' },
    { id: 2, name: 'Olivia Smith', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop', category: 'Tech Review, Fashion' },
    { id: 3, name: 'Alex Chen', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop', category: 'Entertainment' },
  ];

  const stats = [
    { value: '50+', label: 'Brands in campaign', icon: Users },
    { value: '160M+', label: 'Total in creators', icon: TrendingUp },
    { value: '4.8/5', label: 'Average Rating', icon: Star },
  ];

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="grid grid-cols-3 gap-4">
              {creators.map((creator, index) => (
                <div
                  key={creator.id}
                  className={`relative rounded-2xl overflow-hidden shadow-lg ${index === 1 ? 'row-span-2' : ''}`}
                  style={{ height: index === 1 ? '400px' : '190px' }}
                >
                  <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-medium">{creator.name}</span>
                      <CheckCircle size={14} className="text-blue-400 fill-blue-400" />
                    </div>
                    <p className="text-xs text-gray-300">{creator.category}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 h-[190px]" />
              <div className="rounded-2xl overflow-hidden h-[190px]">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="Creator" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Top creators <span className="text-blue-600">who makes</span><br />the dream work.
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Get safe, managed products from discoverers to advanced collaborators. We're meeting
              where the opportunity is greatest — Africa's largest business & digital market.
            </p>

            <div className="flex items-center justify-center gap-8 mb-8 p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Our numbers do<br />the talking for us</h3>
              <div className="flex gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center gap-1">
                      <stat.icon size={16} className={`text-blue-600 ${index === 2 ? 'fill-blue-600' : ''}`} />
                      <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">Trusted by leading Nigeria's brands</p>
              <div className="flex flex-wrap gap-4">
                {['Lagos@claim', 'Lagos@claim', 'LagosNigeria', 'Lagos@claim'].map((brand, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                    <div className={`w-5 h-5 rounded-full ${
                      index === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      index === 1 ? 'bg-black' : index === 2 ? 'bg-red-600' : 'bg-blue-400'
                    }`} />
                    <span className="text-xs text-gray-600">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============== CURATED CREATORS ==============
const CuratedCreators = () => {
  const [activeCategory, setActiveCategory] = useState('All Creators');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All Creators', 'Tech', 'Explore', 'Trending Experts', 'Fashion', 'Travel', 'Business', 'Entertainment'];

  // Fetch creators from API on mount
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        const { data } = await creatorApi.search({ limit: 9 });
        // API returns { data: { creators: [...], pagination: {...} } }
        setCreators(data.data?.creators || []);
      } catch (err) {
        console.error('Failed to load creators:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  // Helper to format price range from rate cards
  const getPriceRange = (creator) => {
    if (!creator.rateCards || creator.rateCards.length === 0) {
      return 'Contact for rates';
    }
    const prices = creator.rateCards.map(rc => rc.basePrice).filter(Boolean);
    if (prices.length === 0) return 'Contact for rates';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `₦${min.toLocaleString()}`;
    return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
  };

  // Helper to get location string
  const getLocation = (creator) => {
    if (creator.state?.name) {
      return creator.city?.name ? `${creator.city.name}, ${creator.state.name}` : creator.state.name;
    }
    return 'Nigeria';
  };

  // Helper to get categories array
  const getCategories = (creator) => {
    if (creator.categories && creator.categories.length > 0) {
      return creator.categories.map(c => typeof c === 'string' ? c : c.name);
    }
    return [creator.tier ? `${creator.tier} Creator` : 'Creator'];
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

  return (
    <section id="find-creators" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex gap-2 mb-4">
            <Link to="/browse" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full">Find Talent</Link>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors">Post a Job</button>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Curated verified<br />creators</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Browse through our diverse community of verified creators across multiple niches. Find the perfect match for your brand campaigns.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-thin rounded-full transition-all duration-300 ${
                activeCategory === category ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No creators found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div key={creator.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getCreatorImage(creator)}
                    alt={creator.displayName || 'Creator'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {creator.featured && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Star size={12} className="fill-current" /> Featured
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getCategories(creator).slice(0, 3).map((cat, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{cat}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={12} />{getLocation(creator)}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{creator.followersCount || '0'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {creator.displayName || 'Creator'}
                        {creator.verified && <Verified size={14} className="text-blue-600 fill-blue-100" />}
                      </h3>
                      <p className="text-sm text-gray-500">{getPriceRange(creator)}</p>
                    </div>
                    <button
                      onClick={() => openModal(creator)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/browse"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            View More Creators
          </Link>
        </div>
      </div>

      {/* Profile Modal */}
      <CreatorProfileModal
        creator={selectedCreator}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
};

// ============== HOW IT WORKS ==============
const HowItWorks = () => {
  const forBrands = ['Budget flexibility', 'Access 10,000+ creators', 'AI matching', 'Escrow payments'];
  const forCreators = ['Verified opportunities', 'Secure payments', 'Portfolio tools', 'Growth analytics'];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How it Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our streamlined process makes it easy to connect brands with the perfect creators</p>
        </div>

        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold">CreatorsWorld</span>
              <span className="text-xs text-gray-400 ml-2">The Trusted Match</span>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Set Your Budget & Requirements</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Tell us what you're looking for and your budget range</p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">For Brands</h4>
                  <ul className="space-y-2">
                    {forBrands.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-blue-600" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">For Creators</h4>
                  <ul className="space-y-2">
                    {forCreators.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileCheck size={20} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Shortlist & Review</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />View detailed creator profiles and past work</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />Check verification, ratings, and reviews</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />Compare and select favorites</li>
                </ul>
              </div>

              <div className="flex justify-center gap-3">
                {['from-purple-500 to-pink-500', 'bg-black', 'bg-red-600', 'bg-blue-400', 'bg-blue-700'].map((color, index) => (
                  <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? `bg-gradient-to-br ${color}` : color}`}>
                    <span className="text-white text-xs font-bold">{['I', 'T', 'Y', 'X', 'L'][index]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Collaborate Seamlessly</h3>
                </div>
                <p className="text-sm text-gray-600">Connect directly with matched creators through our platform</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target size={20} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Brand Manager</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Project Overview</li>
                  <li>• Track status</li>
                  <li>• Feedback</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap size={20} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Creator</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Submit deliverables</li>
                  <li>• Get feedback</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <Link to="/browse" className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">Find the right match</Link>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Track Performance in Real Time</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" />Engagement metrics</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" />ROI tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============== TESTIMONIALS ==============
const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    { id: 1, content: "The transparent pricing and verified creators saved us so much time and money. Found the perfect micro-influencers for our budget. ROI increased by 300%.", author: "Margaret Ige", role: "Content Strategist, Earth Nigeria", rating: 5 },
    { id: 2, content: "CreatorsWorld transformed how we approach influencer marketing. The AI matching saved us weeks of manual searching.", author: "Chidi Okonkwo", role: "Marketing Director, TechHub Lagos", rating: 5 },
    { id: 3, content: "Finally, a platform that understands the African creator economy. The verification process gives us confidence in every collaboration.", author: "Amara Eze", role: "Brand Manager, Fashion Forward", rating: 5 },
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="for-brands" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Verified reviews from<br />Brands</h2>
          <p className="text-gray-400 max-w-xl">Browse through our diverse community of verified creators across multiple niches. Find the perfect match for your brand campaigns.</p>
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="hidden lg:grid grid-cols-3 gap-4 flex-1">
              {[
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=250&fit=crop',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=350&fit=crop',
              ].map((img, index) => (
                <div key={index} className={`rounded-2xl overflow-hidden ${index === 2 ? 'row-span-2' : ''}`}>
                  <img src={img} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=250&fit=crop" alt="Creator" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=250&fit=crop" alt="Creator" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Quote size={48} className="text-blue-600/30 absolute -top-6 -left-4" />

                <div className="relative z-10 min-h-[200px]">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`transition-all duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
                    >
                      <p className="text-xl sm:text-2xl font-medium leading-relaxed mb-8">{testimonial.content}</p>

                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>

                      <div>
                        <p className="font-semibold text-white">{testimonial.author}</p>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-600 hover:bg-gray-500'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============== FAQ ==============
const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('For Brands');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = ['For Brands', 'For Influencers', 'General'];

  const faqs = {
    'For Brands': [
      { question: 'How much does it cost to use creators on the platform?', answer: "Pricing varies based on the creator's following, engagement rate, and campaign scope. Our platform displays transparent pricing ranges for each creator, typically starting from ₦25,000 for micro-influencers to ₦500,000+ for macro-influencers." },
      { question: 'How does the matching process work?', answer: 'Our AI-powered matching system analyzes your brand requirements, target audience, and budget to recommend the most suitable creators. We consider factors like engagement rate, audience demographics, content quality, and past campaign performance.' },
      { question: 'What is the minimum budget for a campaign?', answer: "There's no minimum budget requirement. You can work with micro-influencers starting from as low as ₦25,000 per collaboration." },
      { question: 'Are all creators verified?', answer: 'Yes, all creators on our platform go through a verification process that includes identity verification, follower authenticity checks, and content quality assessment.' },
      { question: 'Can I work with creators outside Nigeria?', answer: "While our primary focus is on African creators, we're expanding our network across the continent. You can filter creators by location." },
      { question: "What if I'm not satisfied with the content done?", answer: 'We offer a satisfaction guarantee. If the delivered content doesn\'t meet the agreed-upon requirements, you can request revisions.' },
    ],
    'For Influencers': [
      { question: 'How do I get verified on the platform?', answer: 'Submit your application with your social media handles, portfolio, and ID. Our team reviews applications within 48-72 hours.' },
      { question: 'When do I get paid?', answer: 'Payments are released through our secure escrow system once the brand approves your deliverables. Funds are transferred within 3-5 business days.' },
      { question: 'What are the requirements to join?', answer: 'You need at least 1,000 genuine followers on any major social platform, consistent content creation history, and authentic engagement.' },
    ],
    'General': [
      { question: 'Is my data secure on the platform?', answer: "Yes, we use industry-standard encryption and security measures to protect all user data. We're GDPR compliant." },
      { question: 'How do I contact support?', answer: 'You can reach our support team via the in-app chat, email at support@creatorsworld.com, or through our social media channels.' },
    ],
  };

  const currentFAQs = faqs[activeCategory] || [];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Got Questions?<br />We've Got <span className="text-blue-600">Answers</span></h2>
          <p className="text-gray-600">Everything you need to know about CreatorsWorld</p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { setActiveCategory(category); setOpenIndex(0); }}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {currentFAQs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-300">
              <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300">Contact Support</button>
        </div>
      </div>
    </section>
  );
};

// ============== MAIN LANDING PAGE ==============
const LandingPage = () => {
  return (
    <div className="bg-white">
      <Hero />
      <TopCreators />
      <CuratedCreators />
      <HowItWorks />
      <Testimonials />
      <FAQ />
    </div>
  );
};

export default LandingPage;
