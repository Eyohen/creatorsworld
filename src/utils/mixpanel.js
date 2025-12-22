import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
const MIXPANEL_TOKEN = 'c9fdb235976ef567b15bcb07bad264f3';

// Initialize Mixpanel
mixpanel.init(MIXPANEL_TOKEN, {
  debug: process.env.NODE_ENV === 'development',
  track_pageview: true,
  persistence: 'localStorage',
});

// Analytics utility object
const analytics = {
  // Identify a user (call after login)
  identify: (userId, userProperties = {}) => {
    mixpanel.identify(userId);
    if (Object.keys(userProperties).length > 0) {
      mixpanel.people.set(userProperties);
    }
  },

  // Track an event
  track: (eventName, properties = {}) => {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  },

  // Reset user (call on logout)
  reset: () => {
    mixpanel.reset();
  },

  // Set user properties
  setUserProperties: (properties) => {
    mixpanel.people.set(properties);
  },

  // Track page view
  trackPageView: (pageName, properties = {}) => {
    mixpanel.track('Page View', {
      page: pageName,
      ...properties,
    });
  },

  // ============ MERCHANT SPECIFIC EVENTS ============

  // Authentication events
  trackLogin: (userId, method = 'email') => {
    analytics.identify(userId);
    analytics.track('User Login', { method });
  },

  trackSignup: (userId, userProperties = {}) => {
    analytics.identify(userId);
    analytics.track('User Signup', userProperties);
    mixpanel.people.set_once({ 'First Login': new Date().toISOString() });
  },

  trackLogout: () => {
    analytics.track('User Logout');
    analytics.reset();
  },

  // Wallet configuration events
  trackWalletConfigured: (network, tokenCount) => {
    analytics.track('Wallet Configured', {
      network,
      token_count: tokenCount,
    });
  },

  trackWalletRemoved: (network) => {
    analytics.track('Wallet Removed', { network });
  },

  // Payment events
  trackPaymentViewed: (paymentId, amount, status) => {
    analytics.track('Payment Viewed', {
      payment_id: paymentId,
      amount,
      status,
    });
  },

  trackTransactionFiltered: (filters) => {
    analytics.track('Transactions Filtered', filters);
  },

  // Settings events
  trackSettingsUpdated: (settingType, newValue) => {
    analytics.track('Settings Updated', {
      setting_type: settingType,
      new_value: newValue,
    });
  },

  // Dashboard events
  trackDashboardViewed: (stats = {}) => {
    analytics.track('Dashboard Viewed', stats);
  },

  // API Key events
  trackAPIKeyGenerated: () => {
    analytics.track('API Key Generated');
  },

  trackAPIKeyViewed: () => {
    analytics.track('API Key Viewed');
  },
};

export default analytics;
