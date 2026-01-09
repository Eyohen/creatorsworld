import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Parse JWT to get expiry time
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Get time until token expires (in ms)
const getTokenTimeToExpiry = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return 0;
  return payload.exp * 1000 - Date.now();
};

export const 
AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimeoutRef = useRef(null);

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeToExpiry = getTokenTimeToExpiry(token);
    // Refresh 5 minutes before expiry, or immediately if less than 5 min left
    const refreshTime = Math.max(timeToExpiry - 5 * 60 * 1000, 0);

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const { data } = await authApi.refreshToken();
          const newToken = data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          scheduleTokenRefresh(newToken);
        } catch (err) {
          console.error('Proactive token refresh failed:', err);
          // Don't logout here - let the interceptor handle it on next request
        }
      }, refreshTime);
    }
  }, []);

  // Clear scheduled refresh
  const clearScheduledRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Handle logout event from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      clearScheduledRefresh();
      setUser(null);
      setProfile(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearScheduledRefresh]);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();

    return () => clearScheduledRefresh();
  }, [clearScheduledRefresh]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      const timeToExpiry = getTokenTimeToExpiry(token);
      if (timeToExpiry <= 0) {
        // Token expired, try to refresh
        try {
          const { data } = await authApi.refreshToken();
          const newToken = data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          scheduleTokenRefresh(newToken);
        } catch (refreshErr) {
          // Refresh failed, clear token
          localStorage.removeItem('accessToken');
          setLoading(false);
          return;
        }
      } else {
        // Schedule refresh for valid token
        scheduleTokenRefresh(token);
      }

      const { data } = await authApi.me();
      setUser(data.data.user);
      setProfile(data.data.profile);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('accessToken');
      clearScheduledRefresh();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await authApi.login({ email, password });

      const token = data.data.accessToken;
      localStorage.setItem('accessToken', token);
      setUser(data.data.user);

      // Schedule token refresh
      scheduleTokenRefresh(token);

      // Fetch full profile
      const profileRes = await authApi.me();
      setProfile(profileRes.data.data.profile);

      return data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (email, password, userType) => {
    try {
      setError(null);
      const { data } = await authApi.register({ email, password, userType });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      clearScheduledRefresh();
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.data.user);
      setProfile(data.data.profile);
    } catch (err) {
      console.error('Profile refresh failed:', err);
    }
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isCreator: user?.userType === 'creator',
    isBrand: user?.userType === 'brand',
    isAdmin: user?.userType === 'admin',
    onboardingComplete: profile?.onboardingCompleted || false,
    onboardingStep: profile?.onboardingStep || 1,
    login,
    register,
    logout,
    checkAuth,
    refreshProfile,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
