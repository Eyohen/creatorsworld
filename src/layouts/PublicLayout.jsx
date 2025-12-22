import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, ChevronDown, Bell, Instagram, Twitter, Linkedin,
  Youtube, Mail, Phone, MapPin
} from 'lucide-react';

const PublicLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return 'U';
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-lg">CreatorsWorld</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">How it Works</a>
              <Link to="/browse" className="text-gray-300 hover:text-white transition-colors text-sm">Find Creators</Link>
              <a href="#for-brands" className="text-gray-300 hover:text-white transition-colors text-sm">For Brands</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <Link
                    to={user?.userType === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
                    className="flex items-center gap-2 bg-slate-800 rounded-full pl-1 pr-3 py-1 hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{getUserInitials()}</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 ml-1" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-slate-700">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">Find Creators</Link>
                <a href="#for-brands" className="text-gray-300 hover:text-white transition-colors">For Brands</a>
                {isAuthenticated ? (
                  <Link
                    to={user?.userType === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - Add padding-top to account for fixed navbar */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="font-semibold text-xl">CreatorsWorld</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Connecting brands with authentic African creators. Building the future of influencer marketing in Africa.
              </p>

              <div className="space-y-3 mb-6">
                <a href="mailto:hello@creatorsworld.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Mail size={18} />hello@creatorsworld.com
                </a>
                <a href="tel:+2348000000000" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Phone size={18} />+234 800 000 0000
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin size={18} />Lagos, Nigeria
                </div>
              </div>

              <div className="flex gap-3">
                {[Instagram, Twitter, Linkedin, Youtube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/browse" className="text-gray-400 hover:text-white transition-colors">Find Creators</Link></li>
                <li><Link to="/register?type=brand" className="text-gray-400 hover:text-white transition-colors">For Brands</Link></li>
                <li><Link to="/register?type=creator" className="text-gray-400 hover:text-white transition-colors">For Influencers</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="py-8 border-t border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-white mb-1">Subscribe to our newsletter</h3>
                <p className="text-gray-400 text-sm">Get the latest updates on creator marketing</p>
              </div>
              <form className="flex gap-2 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 sm:w-64 px-4 py-3 bg-slate-800 rounded-full text-white placeholder-gray-500 border border-slate-700 focus:border-blue-600 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="py-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} CreatorsWorld. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
