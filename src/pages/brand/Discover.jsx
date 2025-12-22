import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { creatorApi, lookupApi, brandApi } from '../../api';

const Discover = () => {
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

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
  }, [filters, pagination.page]);

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
        page: pagination.page,
        limit: pagination.limit,
      };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const { data } = await creatorApi.search(params);
      setCreators(data.data.creators || []);
      setPagination(prev => ({ ...prev, total: data.data.total || 0 }));
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSaveCreator = async (creatorId) => {
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-3xl text-gray-900">Discover Creators</h1>
        <Link to="/brand/saved" className="text-blue-600 hover:underline">
          View Saved ({savedIds.size})
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>

          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter/X</option>
          </select>

          <select
            value={filters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Creators</option>
            <option value="true">Verified Only</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="followers">Most Followers</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Price Range */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm text-gray-600">Price Range:</span>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min ₦"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max ₦"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : creators.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-500">No creators found matching your criteria</p>
          <button onClick={clearFilters} className="text-blue-600 hover:underline mt-2">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{pagination.total} creators found</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div key={creator.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="h-32 bg-gray-200 relative">
                  {creator.coverImage && (
                    <img src={creator.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => toggleSaveCreator(creator.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <svg
                      className={`w-5 h-5 ${savedIds.has(creator.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="w-16 h-16 rounded-full bg-gray-200 -mt-10 border-4 border-white flex items-center justify-center overflow-hidden">
                      {creator.profileImage ? (
                        <img src={creator.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-xl">{creator.displayName?.[0]}</span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{creator.displayName}</h3>
                        {creator.tier !== 'rising' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            creator.tier === 'elite' ? 'bg-purple-100 text-purple-600' :
                            creator.tier === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {creator.tier}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {creator.state?.name || 'Nigeria'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{creator.bio}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{(creator.totalFollowers || 0).toLocaleString()} followers</span>
                      {parseFloat(creator.averageRating) > 0 && (
                        <span>⭐ {parseFloat(creator.averageRating).toFixed(1)}</span>
                      )}
                    </div>
                    {creator.startingPrice && (
                      <span className="text-blue-600 font-semibold">
                        From ₦{parseFloat(creator.startingPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/brand/creator/${creator.id}`}
                    className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discover;
