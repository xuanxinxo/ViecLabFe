import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

// Base API configuration
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');
console.log("api url: ", API_URL);
// Simple cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry mechanism for failed requests with improved error handling
const retryRequest = async (fn: () => Promise<any>, maxRetries: number = 3, delay: number = 2000): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`[API Retry] Attempt ${i + 1}/${maxRetries} failed:`, error);

      // Don't retry for certain errors
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        throw error;
      }

      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, i) + Math.random() * 1000;
      console.log(`[API Retry] Waiting ${Math.round(backoffDelay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

// Helper function to get cached data or fetch new data
const getCachedOrFetch = async (key: string, fetchFn: () => Promise<any>) => {
  const cached = apiCache.get(key);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`[API Cache] Using cached data for ${key}`);
    return cached.data;
  }

  console.log(`[API Cache] Fetching fresh data for ${key}`);
  const data = await retryRequest(fetchFn);
  apiCache.set(key, { data, timestamp: now });
  return data;
};

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // No timeout - let requests wait as long as needed
  withCredentials: true, // This ensures cookies are sent with requests
});

// Create local API instance for frontend routes
const localApi: AxiosInstance = axios.create({
  baseURL: '/api', // Use local API routes (relative path)
  headers: {
    'Content-Type': 'application/json',
  },
  // No timeout - let requests wait as long as needed
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Skip auth for login and public routes
    const publicRoutes = ['/auth/login', '/auth/register'];
    const isPublicRoute = config.url && publicRoutes.some(route => config.url?.includes(route));

    // For admin routes, cookies will be sent automatically by the browser
    // No need to manually add Authorization header for admin routes
    if (!isPublicRoute && !config.url?.includes('/admin/')) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }


    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for local API
localApi.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData requests
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    console.error('[LOCAL API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // No timeout handling since we removed timeouts

    // Handle network errors
    if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
      console.warn('[API] Network error - check internet connection');
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        originalError: error,
        isNetworkError: true
      });
    }

    // Handle unauthorized access (401) or forbidden (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only redirect if we're on client-side, not already on the login page, and not an admin API call
      if (typeof window !== 'undefined' &&
        !window.location.pathname.includes('/admin/login') &&
        !error.config?.url?.includes('/admin/')) {
        // Clear any existing auth tokens
        localStorage.removeItem('adminToken');
        // Redirect to login page
        window.location.href = '/admin/login';
      }

      // Return a clean error object
      return Promise.reject({
        status: error.response.status,
        message: 'Unauthorized access. Please log in.',
        originalError: error
      });
    }

    // For other errors, check if the response is HTML (like a login page)
    const contentType = error.response?.headers?.['content-type'] || '';
    if (contentType.includes('text/html') && error.response?.data?.startsWith('<!DOCTYPE')) {
      return Promise.reject({
        status: 401,
        message: 'Session expired. Please log in again.',
        originalError: error
      });
    }

    // For other types of errors, return the original error
    return Promise.reject(error);
  }
);

// Response interceptor for local API
localApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[LOCAL API] Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Generic API client with retry and fallback
const createApiClient = <T>(endpoint: string, apiInstance: AxiosInstance = api) => ({
  getAll: async (params?: any): Promise<AxiosResponse<T[]>> => {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;

    try {
      const response = await getCachedOrFetch(cacheKey, async () => {
        const response = await apiInstance.get(`/${endpoint}`, { params });

        // Handle different response formats from backend
        if (response.data && typeof response.data === 'object') {
          if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items)) {
            // Backend returns {success: true, data: {items: [...], pagination: {...}}}
            return { ...response, data: response.data.data.items };
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Backend returns {data: [...], success: true}
            return { ...response, data: response.data.data };
          } else if (Array.isArray(response.data)) {
            // Backend returns array directly
            return response;
          }
        }

        return response;
      });

      return response;
    } catch (error: any) {
      // Return fallback data for jobs endpoint to prevent complete failure
      if (endpoint === 'jobs' || endpoint === 'newjobs') {
        return {
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any
        };
      }

      throw error;
    }
  },

  getById: (id: string): Promise<AxiosResponse<T>> =>
    apiInstance.get(`/${endpoint}/${id}`),

  create: (data: Partial<T>): Promise<AxiosResponse<T>> =>
    apiInstance.post(`/${endpoint}`, data),

  update: (id: string, data: Partial<T>): Promise<AxiosResponse<T>> =>
    apiInstance.put(`/${endpoint}/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    apiInstance.delete(`/${endpoint}/${id}`),

  // Additional methods can be added here
  customRequest: <R = any>(config: AxiosRequestConfig): Promise<AxiosResponse<R>> =>
    apiInstance(config),
});

// Helper function to add admin token to requests
// Note: For admin routes, cookies are sent automatically by the browser
// This function is kept for backward compatibility but doesn't add Authorization header
const addAdminToken = (config: any = {}) => {
  // Cookies will be sent automatically by the browser for same-origin requests
  // No need to manually add Authorization header
  return config;
};

// API clients for different resources
// Admin API client with admin-specific methods
export const adminApi = {
  // User management
  users: {
    getAll: (params?: any) => api.get('/admin/users', addAdminToken({ params })),
    getById: (id: string) => api.get(`/admin/users/${id}`, addAdminToken({})),
    update: (id: string, data: any) => api.put(`/admin/users/${id}`, data, addAdminToken({})),
    delete: (id: string) => api.delete(`/admin/users/${id}`, addAdminToken({})),
  },
  // Job management
  jobs: {
    getAll: (params?: any) => localApi.get('/jobs', { params }),

    getById: (id: string) => localApi.get(`/jobs/${id}`),
    create: (data: any) => {
      // Use jobs API for creating jobs
      return localApi.post('/jobs', data);
    },
    update: (id: string, data: any) => localApi.put(`/jobs/${id}`, data),
    delete: (id: string) => localApi.delete(`/jobs/${id}`),
    updateStatus: (id: string, status: string) => localApi.put(`/jobs/${id}/status`, { status }),
  },
  // Application management
  applications: {
    getAll: (params?: any) => localApi.get('/applications', { params }),
    getById: (id: string) => localApi.get(`/applications/${id}`),
    update: (id: string, data: any) => localApi.put(`/applications/${id}`, data),
    delete: (id: string) => localApi.delete(`/applications/${id}`),
  },
  // News management
  news: {
    getAll: (params?: any) => localApi.get('/news', { params }),
    getById: (id: string) => localApi.get(`/news/${id}`),
    create: (data: any) => localApi.post('/news', data),
    update: (id: string, data: any) => localApi.put(`/news/${id}`, data),
    delete: (id: string) => localApi.delete(`/news/${id}`),
  },
  // Hiring management
  hirings: {
    getAll: (params?: any) => localApi.get('/hirings', { params }),
    getById: (id: string) => localApi.get(`/hirings/${id}`),
    create: (data: any) => localApi.post('/hirings', data),
    update: (id: string, data: any) => localApi.put(`/hirings/${id}`, data),
    delete: (id: string) => localApi.delete(`/hirings/${id}`),
  },
  // System settings
  settings: {
    get: () => api.get('/admin/settings', addAdminToken({})),
    update: (data: any) => api.put('/admin/settings', data, addAdminToken({})),
  },
  // Dashboard
  dashboard: {
    get: () => api.get('/admin/dashboard', addAdminToken({})),
  },
  // Profile
  profile: {
    get: () => api.get('/admin/profile', addAdminToken({})),
  },
};

export const apiClient = {
  users: createApiClient<any>('users'),
  jobs: createApiClient<any>('jobs', api), // Use direct backend API
  newJobs: createApiClient<any>('newjobs', api), // Use direct backend API
  toredco: createApiClient<any>('toredco'),
  applications: createApiClient<any>('applications', localApi), // Use local API proxy to backend
  admin: adminApi, // Export admin API methods
  hirings: createApiClient<any>('hirings', api), // Use direct backend API
  news: createApiClient<any>('news', localApi), // Use local API for news only


  // Custom API methods can be added here
  auth: {
    // Use backend API directly for auth
    login: async (credentials: { email: string; password: string }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: controller.signal,
          body: JSON.stringify(credentials),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();

          // Try to parse as JSON for better error handling
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.success === false) {
              throw new Error(errorData.message || 'Đăng nhập thất bại');
            }
          } catch (parseError) {
            // If not JSON, use the text as error message
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error('Login API error:', error);

        // Handle timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Server is taking too long to respond. Please try again.');
        }

        // Handle network errors
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          throw new Error('Network error. Please check your internet connection.');
        }

        throw error;
      }
    },
    register: async (userData: { name: string; email: string; password: string }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: controller.signal,
          body: JSON.stringify(userData),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();

          // If endpoint doesn't exist, return a helpful message
          if (response.status === 404) {
            throw new Error('Chức năng đăng ký chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.');
          }

          // Try to parse as JSON for better error handling
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.success === false) {
              throw new Error(errorData.message || 'Đăng ký thất bại');
            }
          } catch (parseError) {
            // If not JSON, use the text as error message
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error('Register API error:', error);

        // Handle timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Server is taking too long to respond. Please try again.');
        }

        // Handle network errors
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          throw new Error('Network error. Please check your internet connection.');
        }

        throw error;
      }
    },
  },
};
