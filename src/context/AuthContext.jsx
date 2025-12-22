import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await authApi.me();
      setUser(data.data.user);
      setProfile(data.data.profile);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await authApi.login({ email, password });

      localStorage.setItem('accessToken', data.data.accessToken);
      setUser(data.data.user);

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
