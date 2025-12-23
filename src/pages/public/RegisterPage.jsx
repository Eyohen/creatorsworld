import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Users, Briefcase, Check,
  CheckCircle, Star, TrendingUp, Zap, Shield
} from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState(searchParams.get('type') || 'creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'creator' || type === 'brand') {
      setUserType(type);
    }
  }, [searchParams]);

  // Password validation checks
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors = {};

    if (!isEmailValid) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isPasswordValid) {
      errors.password = 'Password does not meet requirements';
    }

    if (!doPasswordsMatch) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await register(email, password, userType);
      setSuccess(true);
    } catch (err) {
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach((e) => {
          apiErrors[e.field] = e.message;
        });
        setFieldErrors(apiErrors);
        setError('Please fix the errors below');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const creatorBenefits = [
    { icon: TrendingUp, text: 'Grow your audience' },
    { icon: Zap, text: 'Get paid for collaborations' },
    { icon: Shield, text: 'Verified creator badge' },
  ];

  const brandBenefits = [
    { icon: Users, text: 'Access 10,000+ creators' },
    { icon: Star, text: 'AI-powered matching' },
    { icon: Shield, text: 'Secure escrow payments' },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong className="text-gray-900">{email}</strong>.
              Please check your inbox and verify your email to continue.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="block w-full py-3.5 border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl text-white">CreatorsWorld</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Join Africa's #1<br />
                <span className="text-blue-400">Creator Marketplace</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-md">
                {userType === 'creator'
                  ? 'Monetize your influence. Connect with top brands and grow your career as a content creator.'
                  : 'Find the perfect creators for your brand. Launch campaigns that drive real results.'}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                {userType === 'creator' ? 'Creator Benefits' : 'Brand Benefits'}
              </p>
              <div className="space-y-3">
                {(userType === 'creator' ? creatorBenefits : brandBenefits).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                      <benefit.icon size={20} className="text-blue-400" />
                    </div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
              ].map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-700"
                >
                  <img src={img} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-white">10,000+</p>
              <p className="text-sm text-gray-400">Active Creators</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-gray-400">Brand Partners</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">$2M+</p>
              <p className="text-sm text-gray-400">Paid to Creators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">CreatorsWorld</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Start your journey with CreatorsWorld</p>
          </div>

          {/* User Type Toggle */}
          <div className="bg-white rounded-2xl p-1.5 mb-6 shadow-sm border border-gray-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserType('creator')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  userType === 'creator'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={18} />
                I'm a Creator
              </button>
              <button
                type="button"
                onClick={() => setUserType('brand')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  userType === 'brand'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Briefcase size={18} />
                I'm a Brand
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white ${
                      fieldErrors.email ? 'border-red-500' : email && isEmailValid ? 'border-green-500' : 'border-gray-200'
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                  {email && isEmailValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <Check size={18} />
                    </div>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white ${
                      fieldErrors.password ? 'border-red-500' : password && isPasswordValid ? 'border-green-500' : 'border-gray-200'
                    }`}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.password}</p>
                )}

                {/* Password Requirements */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { check: passwordChecks.minLength, label: '8+ characters' },
                    { check: passwordChecks.hasUppercase, label: 'Uppercase (A-Z)' },
                    { check: passwordChecks.hasLowercase, label: 'Lowercase (a-z)' },
                    { check: passwordChecks.hasNumber, label: 'Number (0-9)' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1.5 text-xs ${
                        item.check ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        item.check ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {item.check ? (
                          <Check size={10} className="text-green-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white ${
                      fieldErrors.confirmPassword ? 'border-red-500' :
                      confirmPassword && doPasswordsMatch ? 'border-green-500' :
                      confirmPassword && !doPasswordsMatch ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {confirmPassword && doPasswordsMatch && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <Check size={18} />
                    </div>
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                )}
                {confirmPassword && !doPasswordsMatch && !fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        setFieldErrors({ ...fieldErrors, terms: '' });
                      }}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${
                      agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {agreedToTerms && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isEmailValid || !isPasswordValid || !doPasswordsMatch || !agreedToTerms}
                className={`w-full py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${
                  userType === 'creator'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/30'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create {userType === 'creator' ? 'Creator' : 'Brand'} Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign up with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to={`/login?type=${userType}`}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
