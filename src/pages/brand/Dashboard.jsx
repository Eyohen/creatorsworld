import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Wallet, CheckCircle, Search, FileText,
  MessageSquare, ArrowRight, Clock, Star, ChevronRight,
  Sparkles, Target, BarChart3, ArrowUpRight, Crown
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
      const { data } = await brandApi.getDashboardStats();
      setStats(data.data || {});
      // TODO: Load recent requests separately when endpoint is available
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Active Campaigns',
      value: stats?.activeCampaigns || 0,
      icon: Target,
      color: 'blue',
      change: '+2 this month',
      changeType: 'positive'
    },
    {
      label: 'Total Spent',
      value: `₦${(stats?.totalSpent || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'green',
      change: '+12% vs last month',
      changeType: 'positive'
    },
    {
      label: 'Completed Deals',
      value: stats?.completedDeals || 0,
      icon: CheckCircle,
      color: 'purple',
      change: '98% success rate',
      changeType: 'neutral'
    },
    {
      label: 'Saved Creators',
      value: stats?.savedCreators || 0,
      icon: Users,
      color: 'orange',
      change: '+5 this week',
      changeType: 'positive'
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        text: 'text-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const quickActions = [
    {
      title: 'Discover Creators',
      description: 'Find the perfect match for your campaigns',
      icon: Search,
      to: '/brand/discover',
      color: 'blue',
      badge: '5000+ creators'
    },
    {
      title: 'My Campaigns',
      description: `${stats?.pendingRequests || 0} pending requests`,
      icon: FileText,
      to: '/brand/requests',
      color: 'green',
      badge: stats?.pendingRequests ? 'Action needed' : null
    },
    {
      title: 'Messages',
      description: `${stats?.unreadMessages || 0} unread conversations`,
      icon: MessageSquare,
      to: '/brand/messages',
      color: 'purple',
      badge: stats?.unreadMessages ? `${stats.unreadMessages} new` : null
    },
  ];

  // Sample featured creators
  const featuredCreators = [
    {
      id: 1,
      name: 'Adaeze Fashion',
      category: 'Fashion & Lifestyle',
      followers: '125K',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'TechWithChidi',
      category: 'Tech Reviews',
      followers: '89K',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Chef Amara',
      category: 'Food & Recipes',
      followers: '67K',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
  ];

  const getTierInfo = () => {
    const tiers = {
      starter: {
        name: 'Starter Plan',
        features: '10 messages/month • 1 active campaign • 15% fee',
        color: 'gray',
        icon: null
      },
      growth: {
        name: 'Growth Plan',
        features: '50 messages/month • 5 active campaigns • 12% fee',
        color: 'blue',
        icon: TrendingUp
      },
      business: {
        name: 'Business Plan',
        features: '200 messages/month • 20 active campaigns • 10% fee',
        color: 'purple',
        icon: BarChart3
      },
      enterprise: {
        name: 'Enterprise Plan',
        features: 'Unlimited messages • Unlimited campaigns • Custom fees',
        color: 'amber',
        icon: Crown
      }
    };
    return tiers[profile?.tier] || tiers.starter;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const tierInfo = getTierInfo();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 text-sm font-medium">Welcome back</span>
                <Sparkles size={16} className="text-blue-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                {profile?.companyName || user?.firstName || 'Brand'}
              </h1>
              <p className="text-gray-400 max-w-lg">
                Discover talented creators and grow your brand with authentic influencer partnerships. Your next successful campaign starts here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/brand/discover"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/30"
              >
                <Search size={18} />
                Find Creators
              </Link>
              <Link
                to="/brand/requests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                <FileText size={18} />
                View Campaigns
              </Link>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Today\'s Views', value: '1,234' },
              { label: 'Response Rate', value: '92%' },
              { label: 'Avg. Campaign', value: '₦85K' },
              { label: 'Active Chats', value: stats?.unreadMessages || 0 },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center`}>
                  <stat.icon size={24} />
                </div>
                {stat.changeType === 'positive' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const colors = getColorClasses(action.color);
            return (
              <Link
                key={index}
                to={action.to}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon size={28} />
                  </div>
                  {action.badge && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      action.badge === 'Action needed'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.description}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to {action.title}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl text-gray-900">Recent Campaigns</h2>
              <p className="text-sm text-gray-500 mt-0.5">Track your active collaborations</p>
            </div>
            <Link
              to="/brand/requests"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start your first campaign by discovering and connecting with amazing creators.
              </p>
              <Link
                to="/brand/discover"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                <Search size={18} />
                Discover Creators
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/brand/requests/${request.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {request.creator?.avatarUrl ? (
                        <img src={request.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 font-medium">{request.creator?.displayName?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.creator?.displayName}</p>
                      <p className="text-sm text-gray-500">{request.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₦{request.totalAmount?.toLocaleString()}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Clock size={12} />
                      {request.status?.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Creators */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-xl text-gray-900">Recommended Creators</h2>
            <p className="text-sm text-gray-500 mt-0.5">Based on your preferences</p>
          </div>
          <div className="p-4 space-y-3">
            {featuredCreators.map((creator) => (
              <Link
                key={creator.id}
                to="/brand/discover"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {creator.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{creator.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{creator.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">{creator.followers}</p>
                </div>
              </Link>
            ))}
            <Link
              to="/brand/discover"
              className="block w-full py-3 text-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              View all creators
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              tierInfo.color === 'amber'
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : `bg-${tierInfo.color}-100`
            }`}>
              {tierInfo.icon ? (
                <tierInfo.icon size={28} className={tierInfo.color === 'amber' ? 'text-white' : `text-${tierInfo.color}-600`} />
              ) : (
                <Target size={28} className="text-gray-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{tierInfo.name}</h3>
                {tierInfo.color === 'amber' && (
                  <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{tierInfo.features}</p>
            </div>
          </div>
          {profile?.tier !== 'enterprise' && (
            <Link
              to="/brand/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
            >
              <Sparkles size={16} />
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
