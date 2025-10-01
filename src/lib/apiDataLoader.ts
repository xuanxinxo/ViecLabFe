// API Data Loader - Utility functions for consistent API data loading
// Based on the smooth handling pattern from newjobs

import { normalizeApiResponse } from './apiResponseNormalizer';

export interface ApiDataLoaderOptions {
  endpoint: string;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

export interface ApiDataLoaderResult<T> {
  data: T[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  error?: string;
}

/**
 * Generic API data loader with consistent error handling and response processing
 */
export async function loadApiData<T>(
  options: ApiDataLoaderOptions
): Promise<ApiDataLoaderResult<T>> {
  const { endpoint, params = {}, timeout = 40000, retries = 3 } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const url = `/api/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log(`[API LOADER] Attempt ${attempt + 1}/${retries + 1}: ${url}`);
      
      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[API LOADER] Response received:`, data);
      
      // Normalize response using our utility
      const normalizedResponse = normalizeApiResponse<T[]>(data, 'Data loaded successfully');
      
      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load data');
      }
      
      const result: ApiDataLoaderResult<T> = {
        data: normalizedResponse.data,
        total: normalizedResponse.pagination?.total || normalizedResponse.data.length,
        pagination: normalizedResponse.pagination,
        success: true,
      };
      
      console.log(`[API LOADER] Success: ${result.data.length} items loaded`);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`[API LOADER] Attempt ${attempt + 1} failed:`, lastError.message);
      
      // On final attempt, try a direct backend fallback once
      if (attempt === retries) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, String(value));
            }
          });
          const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');
          const fallbackUrl = `${backendBase}/api/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
          console.warn(`[API LOADER] Final fallback to backend: ${fallbackUrl}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          const response = await fetch(fallbackUrl, { headers: { 'Content-Type': 'application/json' }, signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          const data = await response.json();
          const normalizedResponse = normalizeApiResponse<T[]>(data, 'Data loaded successfully');
          if (!normalizedResponse.success) {
            throw new Error(normalizedResponse.message || 'Failed to load data');
          }
          const result: ApiDataLoaderResult<T> = {
            data: normalizedResponse.data,
            total: normalizedResponse.pagination?.total || normalizedResponse.data.length,
            pagination: normalizedResponse.pagination,
            success: true,
          };
          console.log(`[API LOADER] Fallback success: ${result.data.length} items loaded`);
          return result;
        } catch (fallbackErr: any) {
          console.error('[API LOADER] Fallback failed:', fallbackErr?.message || fallbackErr);
        }
      } else {
        // If not last attempt, wait and retry
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(`[API LOADER] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  return {
    data: [],
    total: 0,
    success: false,
    error: lastError?.message || 'Failed to load data after multiple attempts',
  };
}

/**
 * Load single item by ID with consistent error handling
 */
export async function loadApiItem<T>(
  endpoint: string,
  id: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<{ data: T | null; success: boolean; error?: string }> {
  const { timeout = 40000, retries = 3 } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `/api/${endpoint}/${id}`;
      console.log(`[API LOADER] Loading item ${id} (attempt ${attempt + 1}/${retries + 1}): ${url}`);
      
      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return { data: null, success: false, error: 'Item not found' };
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[API LOADER] Item response:`, data);
      
      // Handle different response formats for single item
      let itemData: T | null = null;
      
      if (data.success && data.data) {
        // Response format: { success: true, data: {...} }
        itemData = data.data;
      } else if (data.success && (data.news || data.job || data.hiring)) {
        // Response format: { success: true, news: {...} } or similar
        itemData = data.news || data.job || data.hiring;
      } else if (data.id || data.title || data._id || data.name) {
        // Direct item format: { id: ..., title: ..., ... }
        itemData = data;
      } else if (data.success === false) {
        // Error response
        throw new Error(data.message || 'Item not found');
      } else {
        console.error('Unexpected single item response format:', data);
        throw new Error('Invalid response format for single item');
      }
      
      console.log(`[API LOADER] Item loaded successfully:`, itemData);
      return { data: itemData, success: true };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`[API LOADER] Item load attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt === retries) {
        // Final fallback to backend base URL
        try {
          const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');
          const fallbackUrl = `${backendBase}/api/${endpoint}/${id}`;
          console.warn(`[API LOADER] Item final fallback to backend: ${fallbackUrl}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          const response = await fetch(fallbackUrl, { headers: { 'Content-Type': 'application/json' }, signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            if (response.status === 404) {
              return { data: null, success: false, error: 'Item not found' };
            }
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          const data = await response.json();
          let itemData: T | null = null;
          if (data.success && data.data) {
            itemData = data.data;
          } else if (data.success && (data.news || data.job || data.hiring)) {
            itemData = data.news || data.job || data.hiring;
          } else if (data.id || data.title || data._id || data.name) {
            itemData = data;
          } else if (data.success === false) {
            throw new Error(data.message || 'Item not found');
          } else {
            throw new Error('Invalid response format for single item');
          }
          console.log(`[API LOADER] Item fallback loaded successfully`);
          return { data: itemData, success: true };
        } catch (fallbackErr: any) {
          console.error('[API LOADER] Item fallback failed:', fallbackErr?.message || fallbackErr);
        }
      } else {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`[API LOADER] Retrying item load in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return {
    data: null,
    success: false,
    error: lastError?.message || 'Failed to load item after multiple attempts',
  };
}

/**
 * Hook-like function for loading data with state management
 */
export function createDataLoader<T>(
  endpoint: string,
  defaultParams: Record<string, any> = {}
) {
  return {
    load: (params: Record<string, any> = {}) => 
      loadApiData<T>({ 
        endpoint, 
        params: { ...defaultParams, ...params } 
      }),
    loadItem: (id: string, options?: { timeout?: number; retries?: number }) =>
      loadApiItem<T>(endpoint, id, options),
  };
}

// Pre-configured loaders for common endpoints
export const apiLoaders = {
  jobs: createDataLoader('jobs'),
  newjobs: createDataLoader('newjobs'),
  hirings: createDataLoader('hirings'),
  news: createDataLoader('news'),
  applications: createDataLoader('applications'),
};
