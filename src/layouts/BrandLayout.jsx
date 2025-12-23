import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, Search, Heart, FileText, MessageSquare, Settings,
  LogOut, Menu, X, Bell, ChevronDown, Sparkles
} from 'lucide-react';

const BrandLayout = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/brand/discover', label: 'Discover Creators', icon: Search },
    { path: '/brand/saved', label: 'Saved Creators', icon: Heart },
    { path: '/brand/requests', label: 'Campaigns', icon: FileText },
    { path: '/brand/messages', label: 'Messages', icon: MessageSquare },
    { path: '/brand/settings', label: 'Settings', icon: Settings },
  ];

  const getTierBadge = () => {
    const tier = profile?.tier || 'starter';
    const styles = {
      starter: 'bg-gray-100 text-gray-600',
      growth: 'bg-blue-100 text-blue-600',
      business: 'bg-purple-100 text-purple-600',
      enterprise: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    };
    return styles[tier] || styles.starter;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-xl text-white">CreatorsWorld</span>
            </Link>
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Upgrade Card */}
            {profile?.tier !== 'enterprise' && (
              <div className="mt-8 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-blue-200" />
                  <span className="text-sm font-semibold text-white">Upgrade Plan</span>
                </div>
                <p className="text-xs text-blue-100 mb-3">
                  Get more features and unlock unlimited campaigns
                </p>
                <Link
                  to="/brand/settings"
                  className="block w-full py-2 text-center text-sm font-medium bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Plans
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="text-white font-semibold">
                    {profile?.companyName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.companyName || 'Your Brand'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getTierBadge()}`}>
                    {profile?.tier || 'Starter'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search creators, campaigns..."
                    className="w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    {profile?.logoUrl ? (
                      <img src={profile.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {profile?.companyName?.[0] || user?.email?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.companyName || 'Your Brand'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.tier || 'Starter'} Plan</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <Link
                        to="/brand/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        Account Settings
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BrandLayout;
