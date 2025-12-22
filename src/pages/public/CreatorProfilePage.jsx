import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { creatorApi } from '../../api';

const CreatorProfilePage = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreator();
  }, [id]);

  const loadCreator = async () => {
    try {
      const { data } = await creatorApi.getById(id);
      setCreator(data.data);
    } catch (err) {
      console.error('Failed to load creator:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-20">
        <h2 className="font-semibold text-3xl text-gray-900 mb-4">Creator Not Found</h2>
        <Link to="/browse" className="text-green-600 hover:underline">Browse all creators</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
        <div className="h-48 bg-gray-200">
          {creator.coverImage && <img src={creator.coverImage} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center overflow-hidden">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-4xl">{creator.displayName?.[0]}</span>
              )}
            </div>
            <div className="ml-6 pb-2">
              <h1 className="font-semibold text-3xl text-gray-900">{creator.displayName}</h1>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="capitalize">{creator.tier} Creator</span>
                {creator.state && <span>• {creator.city?.name || creator.state.name}</span>}
                {parseFloat(creator.averageRating) > 0 && <span>• ⭐ {parseFloat(creator.averageRating).toFixed(1)}</span>}
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{creator.bio}</p>
          <Link
            to="/login"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Send Collaboration Request
          </Link>
        </div>
      </div>

      {/* Social Accounts */}
      {creator.socialAccounts?.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="font-semibold text-2xl text-gray-900 mb-6">Social Media</h2>
          <div className="flex flex-wrap gap-4">
            {creator.socialAccounts.map((account) => (
              <a
                key={account.id}
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
              >
                <span className="font-medium capitalize">{account.platform}</span>
                <span className="text-gray-500">@{account.username}</span>
                <span className="text-sm text-gray-400">{account.followersCount?.toLocaleString()} followers</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Rate Cards */}
      {creator.rateCards?.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="font-semibold text-2xl text-gray-900 mb-6">Services & Pricing</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {creator.rateCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium capitalize">{card.platform}</span>
                    <span className="text-gray-500"> • {card.contentType}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    ₦{parseFloat(card.basePrice)?.toLocaleString()}
                  </span>
                </div>
                {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
                <p className="text-xs text-gray-400 mt-2">Delivery: {card.deliveryDays} days • {card.revisionsIncluded} revision(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {creator.portfolio?.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="font-semibold text-2xl text-gray-900 mb-6">Portfolio</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {creator.portfolio.map((item) => (
              <div key={item.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {item.mediaUrl && <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfilePage;
