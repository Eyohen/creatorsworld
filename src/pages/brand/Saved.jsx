import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandApi } from '../../api';

const Saved = () => {
  const [savedCreators, setSavedCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedCreators();
  }, []);

  const loadSavedCreators = async () => {
    try {
      const { data } = await brandApi.getSavedCreators();
      setSavedCreators(data.data || []);
    } catch (err) {
      console.error('Failed to load saved creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (creatorId) => {
    try {
      await brandApi.unsaveCreator(creatorId);
      setSavedCreators(savedCreators.filter(s => s.creatorId !== creatorId));
    } catch (err) {
      console.error('Failed to unsave creator:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-3xl text-gray-900">Saved Creators</h1>
        <Link to="/brand/discover" className="text-blue-600 hover:underline">
          Discover More
        </Link>
      </div>

      {savedCreators.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No saved creators yet</h3>
          <p className="text-gray-500 mb-4">Save creators you're interested in for quick access</p>
          <Link to="/brand/discover" className="text-blue-600 font-medium hover:underline">
            Discover creators
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCreators.map((saved) => (
            <div key={saved.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="h-32 bg-gray-200 relative">
                {saved.creator?.coverImageUrl && (
                  <img src={saved.creator.coverImageUrl} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => handleUnsave(saved.creatorId)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start">
                  <div className="w-16 h-16 rounded-full bg-gray-200 -mt-10 border-4 border-white flex items-center justify-center overflow-hidden">
                    {saved.creator?.avatarUrl ? (
                      <img src={saved.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xl">{saved.creator?.displayName?.[0]}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{saved.creator?.displayName}</h3>
                      {saved.creator?.tier !== 'rising' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          saved.creator?.tier === 'elite' ? 'bg-purple-100 text-purple-600' :
                          saved.creator?.tier === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {saved.creator?.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {saved.creator?.state?.name || 'Nigeria'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{saved.creator?.bio}</p>

                {saved.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{saved.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Saved {new Date(saved.createdAt).toLocaleDateString()}
                  </span>
                  {saved.creator?.startingPrice && (
                    <span className="text-blue-600 font-semibold">
                      From ₦{saved.creator.startingPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <Link
                  to={`/brand/creator/${saved.creatorId}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
