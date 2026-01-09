import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CreatorLayout from './layouts/CreatorLayout';
import BrandLayout from './layouts/BrandLayout';
import OnboardingLayout from './layouts/OnboardingLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import CreatorProfilePage from './pages/public/CreatorProfilePage';
import BrowseCreatorsPage from './pages/public/BrowseCreatorsPage';

// Onboarding Pages
import CreatorOnboarding from './pages/onboarding/CreatorOnboarding';
import BrandOnboarding from './pages/onboarding/BrandOnboarding';

// Creator Dashboard Pages
import CreatorDashboard from './pages/creator/Dashboard';
import CreatorProfile from './pages/creator/Profile';
import CreatorPortfolio from './pages/creator/Portfolio';
import CreatorRateCards from './pages/creator/RateCards';
import CreatorRequests from './pages/creator/Requests';
import CreatorRequestDetail from './pages/creator/RequestDetail';
import CreatorEarnings from './pages/creator/Earnings';
import CreatorAvailability from './pages/creator/Availability';
import CreatorMessages from './pages/creator/Messages';
import CreatorSettings from './pages/creator/Settings';

// Brand Dashboard Pages
import BrandDashboard from './pages/brand/Dashboard';
import BrandDiscover from './pages/brand/Discover';
import BrandSaved from './pages/brand/Saved';
import BrandRequests from './pages/brand/Requests';
import BrandRequestDetail from './pages/brand/RequestDetail';
import BrandMessages from './pages/brand/Messages';
import BrandSettings from './pages/brand/Settings';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { isAuthenticated, user, loading, onboardingComplete } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user type access
  if (allowedTypes.length > 0 && !allowedTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  // Check onboarding status
  if (!onboardingComplete && !window.location.pathname.includes('/onboarding')) {
    if (user.userType === 'creator') {
      return <Navigate to="/onboarding/creator" replace />;
    } else if (user.userType === 'brand') {
      return <Navigate to="/onboarding/brand" replace />;
    }
  }

  return children;
};

// Guest Route wrapper (only for non-authenticated users)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading, onboardingComplete } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated) {
    // Redirect based on user type and onboarding status
    if (!onboardingComplete) {
      if (user.userType === 'creator') {
        return <Navigate to="/onboarding/creator" replace />;
      } else if (user.userType === 'brand') {
        return <Navigate to="/onboarding/brand" replace />;
      }
    }

    if (user.userType === 'creator') {
      return <Navigate to="/creator/dashboard" replace />;
    } else if (user.userType === 'brand') {
      return <Navigate to="/brand/dashboard" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowseCreatorsPage />} />
        <Route path="/creator/:id" element={<CreatorProfilePage />} />
      </Route>

      {/* Auth Routes (Guest only) */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Onboarding Routes */}
      <Route element={<OnboardingLayout />}>
        <Route
          path="/onboarding/creator"
          element={
            <ProtectedRoute allowedTypes={['creator']}>
              <CreatorOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/brand"
          element={
            <ProtectedRoute allowedTypes={['brand']}>
              <BrandOnboarding />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Creator Dashboard Routes */}
      <Route element={<CreatorLayout />}>
        <Route
          path="/creator/dashboard"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/creator/profile"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorProfile /></ProtectedRoute>}
        />
        <Route
          path="/creator/portfolio"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorPortfolio /></ProtectedRoute>}
        />
        <Route
          path="/creator/rate-cards"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorRateCards /></ProtectedRoute>}
        />
        <Route
          path="/creator/requests"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorRequests /></ProtectedRoute>}
        />
        <Route
          path="/creator/requests/:id"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorRequestDetail /></ProtectedRoute>}
        />
        <Route
          path="/creator/earnings"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorEarnings /></ProtectedRoute>}
        />
        <Route
          path="/creator/availability"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorAvailability /></ProtectedRoute>}
        />
        <Route
          path="/creator/messages"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorMessages /></ProtectedRoute>}
        />
        <Route
          path="/creator/messages/:conversationId"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorMessages /></ProtectedRoute>}
        />
        <Route
          path="/creator/settings"
          element={<ProtectedRoute allowedTypes={['creator']}><CreatorSettings /></ProtectedRoute>}
        />
      </Route>

      {/* Brand Dashboard Routes */}
      <Route element={<BrandLayout />}>
        <Route
          path="/brand/dashboard"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandDashboard /></ProtectedRoute>}
        />
        <Route
          path="/brand/discover"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandDiscover /></ProtectedRoute>}
        />
        <Route
          path="/brand/saved"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandSaved /></ProtectedRoute>}
        />
        <Route
          path="/brand/requests"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandRequests /></ProtectedRoute>}
        />
        <Route
          path="/brand/requests/:id"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandRequestDetail /></ProtectedRoute>}
        />
        <Route
          path="/brand/messages"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandMessages /></ProtectedRoute>}
        />
        <Route
          path="/brand/messages/:conversationId"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandMessages /></ProtectedRoute>}
        />
        <Route
          path="/brand/settings"
          element={<ProtectedRoute allowedTypes={['brand']}><BrandSettings /></ProtectedRoute>}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
