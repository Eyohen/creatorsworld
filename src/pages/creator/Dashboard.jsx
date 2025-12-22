import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { creatorApi } from '../../api';
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
      const { data } = await creatorApi.getDashboard();
      setStats(data.data.stats);
      setRecentRequests(data.data.recentRequests || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="font-semibold text-3xl mb-2">
          Welcome back, {user?.creator?.displayName || user?.firstName}!
        </h1>
        <p className="opacity-90">
          {user?.creator?.tier === 'rising' && "You're just getting started! Complete your profile to attract more brands."}
          {user?.creator?.tier === 'verified' && "Great progress! Keep delivering quality work to level up."}
          {user?.creator?.tier === 'premium' && "You're doing amazing! Premium creators get 15% platform fees."}
          {user?.creator?.tier === 'elite' && "You're among the top creators! Enjoy 10% platform fees."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Total Earnings</p>
          <p className="font-semibold text-2xl text-gray-900">
            ₦{(stats?.totalEarnings || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="font-semibold text-2xl text-gray-900">
            ₦{(stats?.pendingEarnings || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Completed Jobs</p>
          <p className="font-semibold text-2xl text-gray-900">
            {stats?.completedJobs || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Profile Views</p>
          <p className="font-semibold text-2xl text-gray-900">
            {stats?.profileViews || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/creator/requests"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Requests</h3>
              <p className="text-sm text-gray-500">
                {stats?.pendingRequests || 0} pending
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/creator/messages"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <Link
          to="/creator/earnings"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Earnings</h3>
              <p className="text-sm text-gray-500">
                ₦{(stats?.availableBalance || 0).toLocaleString()} available
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-900">Recent Requests</h2>
          <Link to="/creator/requests" className="text-green-600 text-sm hover:underline">
            View all
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No requests yet. Complete your profile to start receiving collaboration requests!</p>
            <Link to="/creator/profile" className="text-green-600 hover:underline mt-2 inline-block">
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/creator/requests/${request.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {request.brand?.logoUrl ? (
                      <img src={request.brand.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-500">{request.brand?.companyName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.brand?.companyName}</p>
                    <p className="text-sm text-gray-500">{request.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₦{request.totalAmount?.toLocaleString()}</p>
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

      {/* Tier Progress */}
      {user?.creator?.tier !== 'elite' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-xl text-gray-900 mb-4">Tier Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Current: {user?.creator?.tier}</span>
                <span className="text-gray-600">Next: {
                  user?.creator?.tier === 'rising' ? 'Verified' :
                  user?.creator?.tier === 'verified' ? 'Premium' : 'Elite'
                }</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${Math.min((stats?.tierProgress || 0), 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {user?.creator?.tier === 'rising' && 'Complete 5 deals and earn ₦200,000 to become Verified'}
              {user?.creator?.tier === 'verified' && 'Complete 20 deals and earn ₦1,000,000 to become Premium'}
              {user?.creator?.tier === 'premium' && 'Complete 50 deals, earn ₦5,000,000, and maintain 4.8+ rating to become Elite'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
