import { useState, useEffect } from 'react';
import { creatorApi } from '../../api';

const RateCards = () => {
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    platform: 'instagram',
    contentType: 'post',
    pricingType: 'range',
    price: '',
    priceMin: '',
    priceMax: '',
    deliveryDays: '',
    description: '',
  });

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
  ];

  const contentTypeOptions = {
    instagram: ['post', 'story', 'reel', 'carousel', 'live'],
    tiktok: ['video', 'live', 'duet'],
    youtube: ['video', 'short', 'live', 'community_post'],
    twitter: ['tweet', 'thread', 'space'],
  };

  useEffect(() => {
    loadRateCards();
  }, []);

  const loadRateCards = async () => {
    try {
      const { data } = await creatorApi.getMyRateCards();
      setRateCards(data.data || []);
    } catch (err) {
      console.error('Failed to load rate cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const submitData = {
      platform: form.platform,
      contentType: form.contentType,
      deliveryDays: form.deliveryDays ? parseInt(form.deliveryDays) : 7,
      description: form.description,
      priceType: form.pricingType === 'fixed' ? 'fixed' : 'range',
    };

    if (form.pricingType === 'fixed') {
      submitData.basePrice = parseFloat(form.price);
    } else {
      submitData.basePrice = parseFloat(form.priceMin);
      submitData.maxPrice = parseFloat(form.priceMax);
    }

    try {
      if (editCard) {
        await creatorApi.updateRateCard(editCard.id, submitData);
      } else {
        await creatorApi.addRateCard(submitData);
      }
      loadRateCards();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rate card');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rate card?')) return;

    try {
      await creatorApi.deleteRateCard(id);
      setRateCards(rateCards.filter(card => card.id !== id));
    } catch (err) {
      setError('Failed to delete rate card');
    }
  };

  const openAddModal = () => {
    setEditCard(null);
    setForm({
      platform: 'instagram',
      contentType: 'post',
      pricingType: 'range',
      price: '',
      priceMin: '',
      priceMax: '',
      deliveryDays: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (card) => {
    setEditCard(card);
    setForm({
      platform: card.platform,
      contentType: card.contentType,
      pricingType: card.priceType === 'fixed' ? 'fixed' : 'range',
      price: card.basePrice || '',
      priceMin: card.basePrice || '',
      priceMax: card.maxPrice || '',
      deliveryDays: card.deliveryDays || '',
      description: card.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCard(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-3xl text-gray-900">Rate Cards</h1>
          <p className="text-gray-500">Set your pricing for different content types</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          + Add Rate Card
        </button>
      </div>

      {rateCards.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No rate cards yet</h3>
          <p className="text-gray-500 mb-4">Add your pricing to let brands know your rates</p>
          <button
            onClick={openAddModal}
            className="text-green-600 font-medium hover:underline"
          >
            Add your first rate card
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rateCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {card.platform} {card.contentType}
                  </h3>
                  {card.deliveryDays && (
                    <p className="text-sm text-gray-500">{card.deliveryDays} day delivery</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(card)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-2xl font-semibold text-green-600">
                {card.priceType === 'fixed' ? (
                  `₦${Number(card.basePrice).toLocaleString()}`
                ) : (
                  `₦${Number(card.basePrice).toLocaleString()} - ₦${Number(card.maxPrice).toLocaleString()}`
                )}
              </div>
              {card.description && (
                <p className="text-sm text-gray-600 mt-3">{card.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-2xl text-gray-900">
                {editCard ? 'Edit Rate Card' : 'Add Rate Card'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value, contentType: contentTypeOptions[e.target.value][0] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {platformOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                  <select
                    value={form.contentType}
                    onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {contentTypeOptions[form.platform].map((type) => (
                      <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingType"
                      value="fixed"
                      checked={form.pricingType === 'fixed'}
                      onChange={() => setForm({ ...form, pricingType: 'fixed' })}
                      className="text-green-600"
                    />
                    <span>Fixed Price</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingType"
                      value="range"
                      checked={form.pricingType === 'range'}
                      onChange={() => setForm({ ...form, pricingType: 'range' })}
                      className="text-green-600"
                    />
                    <span>Price Range</span>
                  </label>
                </div>
              </div>

              {form.pricingType === 'fixed' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="50000"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₦) *</label>
                    <input
                      type="number"
                      value={form.priceMin}
                      onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="20000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₦) *</label>
                    <input
                      type="number"
                      value={form.priceMax}
                      onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="100000"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (days)</label>
                <input
                  type="number"
                  value={form.deliveryDays}
                  onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What's included in this service..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  {editCard ? 'Save Changes' : 'Add Rate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateCards;
