import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const OnboardingLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-lg text-white">CreatorsWorld</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Sparkles size={16} className="text-blue-400" />
              <span>Setting up your profile</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default OnboardingLayout;
