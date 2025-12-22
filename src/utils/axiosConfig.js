// src/utils/axiosConfig.js
import axios from 'axios';

export const setupAxiosInterceptors = (navigate, logout) => {
  // Request interceptor to add auth token and API keys to all requests
  axios.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      // Get user data for API keys
      const userStr = localStorage.getItem('user');
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // If token exists, add it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add API Key and Secret if available
      if (user?.apiKey) {
        config.headers['x-api-key'] = user.apiKey;
      }
      if (user?.apiSecret) {
        config.headers['x-api-secret'] = user.apiSecret;
      }

      return config;
    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle authentication errors
  axios.interceptors.response.use(
    (response) => {
      // If the response is successful, just return it
      return response;
    },
    (error) => {
      // Check if the error is due to authentication
      if (error.response) {
        const status = error.response.status;

        // Handle 401 Unauthorized or 403 Forbidden
        if (status === 401 || status === 403) {
          console.log('Session expired or unauthorized. Redirecting to login...');

          // Clear auth data
          if (logout) {
            logout();
          } else {
            // Fallback: manually clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
          }

          // Redirect to login
          if (navigate) {
            navigate('/', { replace: true });
          } else {
            // Fallback: use window.location
            window.location.href = '/';
          }
        }
      }

      // Return the error for further handling
      return Promise.reject(error);
    }
  );
};
