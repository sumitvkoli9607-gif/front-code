import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/google')) {
      
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          throw new Error('No user email found');
        }
        
        // Request new token
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          email: userEmail
        }, {
          skipAuthRefresh: true // Custom flag to skip this request from interceptors
        } as any);
        
        if (refreshResponse.data.success) {
          // Save new token
          localStorage.setItem('token', refreshResponse.data.token);
          
          // Update authorization header
          api.defaults.headers.common.Authorization = `Bearer ${refreshResponse.data.token}`;
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          
          // Process queued requests
          processQueue(null, refreshResponse.data.token);
          
          // Retry original request
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, clear local storage and redirect to login
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle subscription errors (403)
    if (error.response?.status === 403) {
      const errorData = error.response.data as { error: string; requiredPlan?: string };
      if (errorData.requiredPlan === 'Enterprise') {
        // Don't reject, just return the error so component can handle it
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if user needs subscription
export const checkSubscriptionError = (error: unknown): { needsUpgrade: boolean; message: string } => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as { error: string; requiredPlan?: string };
    if (error.response?.status === 403 && errorData.requiredPlan === 'Enterprise') {
      return {
        needsUpgrade: true,
        message: errorData.error || 'Upgrade required'
      };
    }
  }
  return { needsUpgrade: false, message: '' };
};

// Export the configured api instance
export default api;