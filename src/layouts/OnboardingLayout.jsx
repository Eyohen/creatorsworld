import { Outlet, Link } from 'react-router-dom';

const OnboardingLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-semibold text-xl font-bold text-green-600">
              CreatorsWorld
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default OnboardingLayout;
