import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await brandApi.getDashboardStats();
      setStats(data.data || {});
      // TODO: Load recent requests separately when endpoint is available
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="font-semibold text-3xl mb-2">
          Welcome back, {user?.brand?.companyName || user?.firstName}!
        </h1>
        <p className="opacity-90">
          Discover talented creators and grow your brand with authentic influencer partnerships.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Active Campaigns</p>
          <p className="font-semibold text-2xl text-gray-900">
            {stats?.activeCampaigns || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <p className="font-semibold text-2xl text-gray-900">
            ₦{(stats?.totalSpent || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Completed Deals</p>
          <p className="font-semibold text-2xl text-gray-900">
            {stats?.completedDeals || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Saved Creators</p>
          <p className="font-semibold text-2xl text-gray-900">
            {stats?.savedCreators || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/brand/discover"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Discover Creators</h3>
              <p className="text-sm text-gray-500">Find your perfect match</p>
            </div>
          </div>
        </Link>

        <Link
          to="/brand/requests"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Requests</h3>
              <p className="text-sm text-gray-500">
                {stats?.pendingRequests || 0} pending
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/brand/messages"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">
                {stats?.unreadMessages || 0} unread
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-900">Recent Requests</h2>
          <Link to="/brand/requests" className="text-blue-600 text-sm hover:underline">
            View all
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No requests yet.</p>
            <Link to="/brand/discover" className="text-blue-600 hover:underline mt-2 inline-block">
              Discover creators
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/brand/requests/${request.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {request.creator?.avatarUrl ? (
                      <img src={request.creator.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-500">{request.creator?.displayName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.creator?.displayName}</p>
                    <p className="text-sm text-gray-500">{request.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">₦{request.totalAmount?.toLocaleString()}</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {request.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {user?.brand?.tier === 'starter' ? 'Starter Plan' :
               user?.brand?.tier === 'growth' ? 'Growth Plan' :
               user?.brand?.tier === 'business' ? 'Business Plan' : 'Enterprise Plan'}
            </h3>
            <p className="text-sm text-gray-500">
              {user?.brand?.tier === 'starter' && '10 messages/month • 1 active campaign • 15% platform fee'}
              {user?.brand?.tier === 'growth' && '50 messages/month • 5 active campaigns • 12% platform fee'}
              {user?.brand?.tier === 'business' && '200 messages/month • 20 active campaigns • 10% platform fee'}
              {user?.brand?.tier === 'enterprise' && 'Unlimited messages • Unlimited campaigns • Custom fees'}
            </p>
          </div>
          {user?.brand?.tier !== 'enterprise' && (
            <Link
              to="/brand/settings"
              className="text-blue-600 font-medium hover:underline"
            >
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
