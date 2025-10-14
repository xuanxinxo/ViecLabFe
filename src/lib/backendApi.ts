// Backend API helper for admin pages
const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');

// Helper function to get auth headers
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Get admin token from cookies
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function to get auth headers for FormData
const getAuthHeadersForFormData = () => {
  const headers: Record<string, string> = {};
  
  // Get admin token from cookies
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API call function
export const backendApi = {
  // GET request
  get: async (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${BACKEND_URL}/api/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // POST request with JSON
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // POST request with FormData
  postFormData: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // PUT request
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // DELETE request
  delete: async (endpoint: string) => {
    const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Specific API functions for different resources
export const adminApi = {
  // News API
  news: {
    getAll: (params?: any) => backendApi.get('news', params),
    getById: (id: string) => backendApi.get(`news/${id}`),
    create: (data: any) => backendApi.postFormData('news', data),
    update: (id: string, data: any) => backendApi.put(`news/${id}`, data),
    delete: (id: string) => backendApi.delete(`news/${id}`),
  },
  
  // Jobs API
  jobs: {
    getAll: (params?: any) => backendApi.get('jobs', params),
    getById: (id: string) => backendApi.get(`jobs/${id}`),
    create: (data: any) => backendApi.postFormData('jobs', data),
    update: (id: string, data: any) => backendApi.put(`jobs/${id}`, data),
    delete: (id: string) => backendApi.delete(`jobs/${id}`),
  },
  
  // Hirings API
  hirings: {
    getAll: (params?: any) => backendApi.get('hirings', params),
    getById: (id: string) => backendApi.get(`hirings/${id}`),
    create: (data: any) => backendApi.post('hirings', data),
    update: (id: string, data: any) => backendApi.put(`hirings/${id}`, data),
    delete: (id: string) => backendApi.delete(`hirings/${id}`),
  },
  
  // Applications API
  applications: {
    getAll: (params?: any) => backendApi.get('applications', params),
    getById: (id: string) => backendApi.get(`applications/${id}`),
    update: (id: string, data: any) => backendApi.put(`applications/${id}`, data),
    delete: (id: string) => backendApi.delete(`applications/${id}`),
  },
  
  // New Jobs API
  newJobs: {
    getAll: (params?: any) => backendApi.get('newjobs', params),
    getById: (id: string) => backendApi.get(`newjobs/${id}`),
    create: (data: any) => backendApi.post('newjobs', data),
    update: (id: string, data: any) => backendApi.put(`newjobs/${id}`, data),
    delete: (id: string) => backendApi.delete(`newjobs/${id}`),
  },
};
