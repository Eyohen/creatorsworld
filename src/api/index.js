import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retrying
    if (error.response?.status === 401 &&
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  changePassword: (data) => api.put('/auth/change-password', data),
  googleAuth: (token, userType) => api.post('/auth/google', { token, userType }),
};

// Creator endpoints
export const creatorApi = {
  search: (params) => api.get('/creators', { params }),
  getById: (id) => api.get(`/creators/${id}`),
  getPortfolio: (id) => api.get(`/creators/${id}/portfolio`),
  getReviews: (id) => api.get(`/creators/${id}/reviews`),
  getRateCards: (id) => api.get(`/creators/${id}/rate-cards`),
  getAvailability: (id, params) => api.get(`/creators/${id}/availability`, { params }),
  // Protected
  getMyProfile: () => api.get('/creators/profile/me'),
  updateProfile: (data) => api.put('/creators/profile', data),
  updateAvatar: (avatarUrl) => api.put('/creators/profile/avatar', { avatarUrl }),
  updateCover: (coverImageUrl) => api.put('/creators/profile/cover', { coverImageUrl }),
  // Onboarding
  getOnboardingStatus: () => api.get('/creators/onboarding/status'),
  saveOnboardingStep: (step, data) => api.post(`/creators/onboarding/step/${step}`, data),
  completeOnboarding: () => api.post('/creators/onboarding/complete'),
  // Social accounts
  getSocialAccounts: () => api.get('/creators/social-accounts'),
  addSocialAccount: (data) => api.post('/creators/social-accounts', data),
  updateSocialAccount: (id, data) => api.put(`/creators/social-accounts/${id}`, data),
  deleteSocialAccount: (id) => api.delete(`/creators/social-accounts/${id}`),
  // Portfolio
  getMyPortfolio: () => api.get('/creators/portfolio/my'),
  addPortfolioItem: (data) => api.post('/creators/portfolio', data),
  updatePortfolioItem: (id, data) => api.put(`/creators/portfolio/${id}`, data),
  deletePortfolioItem: (id) => api.delete(`/creators/portfolio/${id}`),
  // Rate cards
  getMyRateCards: () => api.get('/creators/rate-cards/my'),
  addRateCard: (data) => api.post('/creators/rate-cards', data),
  updateRateCard: (id, data) => api.put(`/creators/rate-cards/${id}`, data),
  deleteRateCard: (id) => api.delete(`/creators/rate-cards/${id}`),
  // Categories
  getMyCategories: () => api.get('/creators/categories/my'),
  updateCategories: (categoryIds) => api.put('/creators/categories', { categoryIds }),
  // Availability
  getMyAvailability: () => api.get('/creators/availability/my'),
  updateAvailability: (data) => api.put('/creators/availability', data),
  addAvailabilitySlot: (data) => api.post('/creators/availability/slots', data),
  deleteAvailabilitySlot: (id) => api.delete(`/creators/availability/slots/${id}`),
  // Dashboard
  getDashboard: () => api.get('/creators/dashboard'),
  getDashboardStats: () => api.get('/creators/dashboard/stats'),
  getEarningsStats: () => api.get('/creators/dashboard/earnings'),
};

// Brand endpoints
export const brandApi = {
  getMyProfile: () => api.get('/brands/profile/me'),
  updateProfile: (data) => api.put('/brands/profile', data),
  updateLogo: (logoUrl) => api.put('/brands/profile/logo', { logoUrl }),
  // Onboarding
  getOnboardingStatus: () => api.get('/brands/onboarding/status'),
  saveOnboardingStep: (step, data) => api.post(`/brands/onboarding/step/${step}`, data),
  completeOnboarding: () => api.post('/brands/onboarding/complete'),
  // Saved creators
  getSavedCreators: () => api.get('/brands/saved-creators'),
  saveCreator: (creatorId) => api.post(`/brands/saved-creators/${creatorId}`),
  unsaveCreator: (creatorId) => api.delete(`/brands/saved-creators/${creatorId}`),
  // Dashboard
  getDashboardStats: () => api.get('/brands/dashboard/stats'),
  getUsageStats: () => api.get('/brands/usage'),
};

// Lookup endpoints
export const lookupApi = {
  getRegions: () => api.get('/lookup/regions'),
  getStates: () => api.get('/lookup/states'),
  getStatesByRegion: (regionId) => api.get(`/lookup/states/${regionId}`),
  getCities: () => api.get('/lookup/cities'),
  getCitiesByState: (stateId) => api.get(`/lookup/cities/${stateId}`),
  getCategories: () => api.get('/lookup/categories'),
  getIndustries: () => api.get('/lookup/industries'),
  getCreatorTiers: () => api.get('/lookup/tiers/creator'),
  getBrandTiers: () => api.get('/lookup/tiers/brand'),
  getPlatforms: () => api.get('/lookup/platforms'),
  getContentTypes: () => api.get('/lookup/content-types'),
};

// Request endpoints
export const requestApi = {
  create: (data) => api.post('/requests', data),
  // Brand
  getBrandRequests: (params) => api.get('/requests/brand/sent', { params }),
  getBrandRequestDetail: (id) => api.get(`/requests/brand/${id}`),
  cancelRequest: (id) => api.put(`/requests/brand/${id}/cancel`),
  approveContent: (id) => api.put(`/requests/brand/${id}/approve-content`),
  requestRevision: (id, notes) => api.put(`/requests/brand/${id}/request-revision`, { notes }),
  completeCollaboration: (id) => api.put(`/requests/brand/${id}/complete`),
  // Creator
  getCreatorRequests: (params) => api.get('/requests/creator/received', { params }),
  getCreatorRequestDetail: (id) => api.get(`/requests/creator/${id}`),
  acceptRequest: (id) => api.put(`/requests/creator/${id}/accept`),
  declineRequest: (id, data) => api.put(`/requests/creator/${id}/decline`, data),
  sendCounterOffer: (id, data) => api.put(`/requests/creator/${id}/counter-offer`, data),
  submitContent: (id, contentUrls) => api.put(`/requests/creator/${id}/submit-content`, { contentUrls }),
  // Shared
  getDetail: (id) => api.get(`/requests/${id}`),
  getTimeline: (id) => api.get(`/requests/${id}/timeline`),
  getNegotiations: (id) => api.get(`/requests/${id}/negotiations`),
};

// Contract endpoints
export const contractApi = {
  getByRequest: (requestId) => api.get(`/contracts/request/${requestId}`),
  getById: (id) => api.get(`/contracts/${id}`),
  sign: (id, signature) => api.post(`/contracts/${id}/sign`, { signature }),
  download: (id) => api.get(`/contracts/${id}/download`, { responseType: 'blob' }),
  getMyContracts: () => api.get('/contracts'),
};

// Payment endpoints
export const paymentApi = {
  initialize: (requestId, amount) => api.post('/payments/initialize', { requestId, amount }),
  verify: (reference) => api.get(`/payments/verify/${reference}`),
  getEarnings: () => api.get('/payments/earnings'),
  getTransactions: () => api.get('/payments/transactions'),
  requestPayout: (data) => api.post('/payments/payout/request', data),
  getPayoutHistory: () => api.get('/payments/payouts'),
  getBankAccounts: () => api.get('/payments/bank-accounts'),
  addBankAccount: (data) => api.post('/payments/bank-accounts', data),
  setPrimaryBank: (id) => api.put(`/payments/bank-accounts/${id}/primary`),
  deleteBankAccount: (id) => api.delete(`/payments/bank-accounts/${id}`),
  getBankList: () => api.get('/payments/banks'),
  verifyBankAccount: (accountNumber, bankCode) => api.post('/payments/bank-accounts/verify', { accountNumber, bankCode }),
};

// Message endpoints
export const messageApi = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) => api.post(`/messages/conversations/${conversationId}/messages`, { content }),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  getByRequest: (requestId) => api.get(`/messages/request/${requestId}`),
};

// Notification endpoints
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Review endpoints
export const reviewApi = {
  create: (requestId, data) => api.post(`/reviews/request/${requestId}`, data),
  getByRequest: (requestId) => api.get(`/reviews/request/${requestId}`),
  respond: (id, response) => api.post(`/reviews/${id}/respond`, { response }),
  getGiven: () => api.get('/reviews/given'),
  getReceived: () => api.get('/reviews/received'),
};

// Upload endpoints
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getSignature: (folder) => api.get('/upload/signature', { params: { folder } }),
  deleteFile: (publicId) => api.delete(`/upload/${publicId}`),
};

export default api;
