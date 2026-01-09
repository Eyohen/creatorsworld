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

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Response interceptor - handle token refresh with queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's an auth error that might need token refresh
    const isAuthError = error.response?.status === 401;
    const isTokenExpired =
      error.response?.data?.code === 'TOKEN_EXPIRED' ||
      error.response?.data?.message?.toLowerCase().includes('token expired') ||
      error.response?.data?.message?.toLowerCase().includes('invalid token');

    // Don't retry if it's a login/register request or already retried
    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/refresh-token');

    if (isAuthError && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        // Update the authorization header
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Clear auth state
        localStorage.removeItem('accessToken');

        // Only redirect if we're not already on auth pages
        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === '/' ||
          currentPath === '/login' ||
          currentPath === '/register' ||
          currentPath === '/forgot-password' ||
          currentPath === '/reset-password' ||
          currentPath.startsWith('/verify-email') ||
          currentPath.startsWith('/creators/');

        if (!isPublicPage) {
          // Dispatch a custom event so AuthContext can handle it
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
  refreshToken: () => api.post('/auth/refresh-token'),
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
  submitContent: (id, data) => api.put(`/requests/creator/${id}/submit-content`, data),
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
  getEscrowStatus: (requestId) => api.get(`/payments/escrow/${requestId}`),
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
  // Contacts (active collaborations)
  getContacts: () => api.get('/messages/contacts'),

  // Conversations
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  createOrGetConversation: (brandId, creatorId, requestId) =>
    api.post('/messages/conversations', { brandId, creatorId, requestId }),
  getByRequest: (requestId) => api.get(`/messages/request/${requestId}`),

  // Messages
  getMessages: (conversationId, params) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content, messageType = 'text', attachments = null) =>
    api.post(`/messages/conversations/${conversationId}/messages`, { content, messageType, attachments }),
  editMessage: (conversationId, messageId, content) =>
    api.patch(`/messages/conversations/${conversationId}/messages/${messageId}`, { content }),
  deleteMessage: (conversationId, messageId) =>
    api.delete(`/messages/conversations/${conversationId}/messages/${messageId}`),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),

  // Reactions
  addReaction: (conversationId, messageId, emoji) =>
    api.post(`/messages/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (conversationId, messageId, emoji) =>
    api.delete(`/messages/conversations/${conversationId}/messages/${messageId}/reactions`, { data: { emoji } }),

  // Typing & Presence
  sendTyping: (conversationId) => api.post(`/messages/conversations/${conversationId}/typing`),
  getPresence: (userId) => api.get(`/messages/users/${userId}/presence`),
  getBulkPresence: (userIds) => api.post('/messages/users/presence/bulk', { userIds }),

  // Attachments
  uploadAttachment: (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/messages/conversations/${conversationId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
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
