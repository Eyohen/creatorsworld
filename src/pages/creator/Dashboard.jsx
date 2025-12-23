import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { creatorApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet, Clock, Briefcase, Eye, FileText, MessageSquare,
  DollarSign, ArrowRight, TrendingUp, Star, Award, Sparkles,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
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

  const getTierInfo = () => {
    const tier = profile?.tier || 'rising';
    const tiers = {
      rising: {
        icon: TrendingUp,
        color: 'text-gray-400',
        bg: 'bg-gray-100',
        next: 'Verified',
        requirement: 'Complete 5 deals and earn ₦200,000 to become Verified'
      },
      verified: {
        icon: Star,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        next: 'Premium',
        requirement: 'Complete 20 deals and earn ₦1,000,000 to become Premium'
      },
      premium: {
        icon: Award,
        color: 'text-purple-500',
        bg: 'bg-purple-100',
        next: 'Elite',
        requirement: 'Complete 50 deals, earn ₦5,000,000, and maintain 4.8+ rating to become Elite'
      },
      elite: {
        icon: Sparkles,
        color: 'text-amber-500',
        bg: 'bg-amber-100',
        next: null,
        requirement: null
      }
    };
    return tiers[tier] || tiers.rising;
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  const getWelcomeMessage = () => {
    const tier = profile?.tier || 'rising';
    const messages = {
      rising: "You're just getting started! Complete your profile to attract more brands.",
      verified: "Great progress! Keep delivering quality work to level up.",
      premium: "You're doing amazing! Premium creators enjoy 15% platform fees.",
      elite: "You're among the top creators! Enjoy exclusive 10% platform fees."
    };
    return messages[tier] || messages.rising;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${tierInfo.bg} flex items-center justify-center`}>
              <TierIcon className={`w-5 h-5 ${tierInfo.color}`} />
            </div>
            <span className="px-3 py-1 text-sm font-medium bg-white/10 text-white rounded-full capitalize">
              {profile?.tier || 'Rising'} Creator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.displayName || user?.firstName || 'Creator'}!
          </h1>
          <p className="text-gray-400 max-w-xl">
            {getWelcomeMessage()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₦{(stats?.totalEarnings || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₦{(stats?.pendingEarnings || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Pending Earnings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Jobs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.completedJobs || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Completed Jobs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.profileViews || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Profile Views</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/creator/requests"
          className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Requests</h3>
                <p className="text-sm text-gray-500">
                  {stats?.pendingRequests || 0} pending requests
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/creator/messages"
          className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Messages</h3>
                <p className="text-sm text-gray-500">
                  {stats?.unreadMessages || 0} unread messages
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/creator/earnings"
          className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Earnings</h3>
                <p className="text-sm text-gray-500">
                  ₦{(stats?.availableBalance || 0).toLocaleString()} available
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-900">Recent Requests</h2>
          <Link
            to="/creator/requests"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Complete your profile to start receiving collaboration requests from brands!
            </p>
            <Link
              to="/creator/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/creator/requests/${request.id}`}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {request.brand?.logoUrl ? (
                      <img src={request.brand.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold text-lg">
                        {request.brand?.companyName?.[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.brand?.companyName}</p>
                    <p className="text-sm text-gray-500">{request.title}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">₦{request.totalAmount?.toLocaleString()}</p>
                    <StatusBadge status={request.status} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tier Progress */}
      {profile?.tier !== 'elite' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-xl text-white">Tier Progress</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm capitalize">{profile?.tier || 'Rising'}</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span className="text-blue-400 text-sm font-medium">{tierInfo.next}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats?.tierProgress || 0), 100)}%` }}
                />
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              {tierInfo.requirement}
            </p>

            <Link
              to="/creator/earnings"
              className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              View detailed progress
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: Clock
    },
    accepted: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle2
    },
    in_progress: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Loader2
    },
    completed: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: CheckCircle2
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: AlertCircle
    }
  };

  const style = statusStyles[status] || statusStyles.pending;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" />
      {status?.replace('_', ' ')}
    </span>
  );
};

export default Dashboard;
