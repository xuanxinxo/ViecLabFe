// API Response Normalizer
// Utility functions to handle different API response formats consistently

export interface NormalizedApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  img?: string;
  requirements?: string[];
  benefits?: string[];
  deadline?: string;
  status?: string;
  createdAt?: string;
  isRemote?: boolean;
  tags?: string[];
}

/**
 * Normalize API response to a consistent format
 */
export function normalizeApiResponse<T>(
  response: any,
  successMessage: string = 'Thành công'
): NormalizedApiResponse<T> {
  try {
    // Handle standard backend format: { success: true, data: { items: [...], pagination: {...} } }
    if (response?.success && response?.data?.items && Array.isArray(response.data.items)) {
      return {
        success: true,
        data: response.data.items as T,
        message: successMessage,
        pagination: response.data.pagination || {
          page: 1,
          limit: response.data.items.length,
          total: response.data.items.length,
          totalPages: 1
        }
      };
    }
    
    // Handle alternative format: { success: true, data: [...] }
    if (response?.success && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data as T,
        message: successMessage,
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1
        }
      };
    }
    
    // Handle direct data array: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data as T,
        message: successMessage,
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1
        }
      };
    }
    
    // Handle direct array: [...]
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response as T,
        message: successMessage,
        pagination: {
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1
        }
      };
    }
    
    // Handle error response
    if (response?.success === false) {
      return {
        success: false,
        data: [] as T,
        message: response.message || 'Có lỗi xảy ra'
      };
    }
    
    // Fallback for unexpected format
    console.warn('Unexpected API response format:', response);
    return {
      success: false,
      data: [] as T,
      message: 'Định dạng dữ liệu không hợp lệ từ server'
    };
    
  } catch (error) {
    console.error('Error normalizing API response:', error);
    return {
      success: false,
      data: [] as T,
      message: 'Không thể xử lý dữ liệu từ server'
    };
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string = 'Có lỗi xảy ra'): NormalizedApiResponse<any> {
  return {
    success: false,
    data: [],
    message
  };
}

/**
 * Sanitize search parameters to prevent injection attacks
 */
export function sanitizeSearchParams(params: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value && typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value.trim().replace(/[<>\"'&]/g, '');
    }
  }
  
  return sanitized;
}

/**
 * Validate search parameters
 */
export function validateSearchParams(searchTerm: string, locationTerm: string): { isValid: boolean; error?: string } {
  const searchQuery = searchTerm.trim();
  const locationQuery = locationTerm.trim();
  
  // Check if at least one search parameter is provided
  if (!searchQuery && !locationQuery) {
    return { isValid: false, error: 'Vui lòng nhập tên công việc hoặc chọn tỉnh/thành phố' };
  }
  
  // Validate search term length
  if (searchQuery && searchQuery.length < 2) {
    return { isValid: false, error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' };
  }
  
  if (searchQuery && searchQuery.length > 100) {
    return { isValid: false, error: 'Từ khóa tìm kiếm không được vượt quá 100 ký tự' };
  }
  
  // Validate location term length
  if (locationQuery && locationQuery.length > 100) {
    return { isValid: false, error: 'Tên tỉnh/thành phố không được vượt quá 100 ký tự' };
  }
  
  return { isValid: true };
}

/**
 * Build search query parameters with multiple format support
 */
export function buildSearchParams(searchTerm: string, locationTerm: string, page: number = 1, limit: number = 10): URLSearchParams {
  const params = new URLSearchParams();
  
  const searchQuery = searchTerm.trim();
  const locationQuery = locationTerm.trim();
  
  // Add search parameters with multiple possible parameter names for compatibility
  if (searchQuery) {
    const sanitizedQuery = sanitizeSearchParams({ q: searchQuery }).q;
    params.append('q', sanitizedQuery);  // Primary search parameter
    params.append('search', sanitizedQuery);  // Alternative parameter name
  }
  
  if (locationQuery) {
    const sanitizedLocation = sanitizeSearchParams({ location: locationQuery }).location;
    params.append('location', sanitizedLocation);
  }
  
  // Add pagination parameters with multiple format support
  params.append('_page', page.toString());
  params.append('_limit', limit.toString());
  params.append('page', page.toString());  // Alternative pagination parameter
  params.append('limit', limit.toString());  // Alternative limit parameter
  
  // Add sorting parameters
  params.append('_sort', 'postedDate');
  params.append('_order', 'desc');
  
  // Add status filter
  params.append('status', 'active');
  
  // Add cache-busting parameter
  params.append('_t', Date.now().toString());
  
  return params;
}