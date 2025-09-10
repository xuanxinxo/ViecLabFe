import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');

export interface Application {
  _id: string;
  jobId?: string;
  hiringId?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  cv?: string;
  status: 'pending' | 'approved' | 'rejected';
  job?: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    type?: string;
    requirements?: string[];
    postedDate?: string;
    deadline?: string;
  };
  hiring?: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    type?: string;
    requirements?: string[];
    postedDate?: string;
    deadline?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getApplications(params?: PaginationParams): Promise<PaginatedResponse<Application>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Call backend directly
  const response = await fetch(`${API_BASE_URL}/api/applications?${queryParams.toString()}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải danh sách đơn ứng tuyển');
  }
  
  return response.json();
}

export async function getFeaturedApplications(limit: number = 8): Promise<Application[]> {
  console.log(`[getFeaturedApplications] Fetching from backend...`);
  
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/applications?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getFeaturedApplications] API error ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[getFeaturedApplications] Backend response:', data);
    
    // Handle backend response format: { success: true, data: { items: [...], pagination: {...} } }
    let applications = [];
    if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
      applications = data.data.items;
      console.log(`[getFeaturedApplications] Using data.data.items: ${applications.length} items`);
    } else if (data.data && Array.isArray(data.data)) {
      applications = data.data;
      console.log(`[getFeaturedApplications] Using data.data: ${applications.length} items`);
    } else if (Array.isArray(data)) {
      applications = data;
      console.log(`[getFeaturedApplications] Using direct array: ${applications.length} items`);
    } else {
      console.warn('[getFeaturedApplications] No valid applications data found in response:', data);
      applications = [];
    }
    
    console.log(`[getFeaturedApplications] Found ${applications.length} applications`);
    return applications;
    
  } catch (error) {
    console.error('[getFeaturedApplications] Fetch error:', error);
    // Return empty array instead of mock data
    console.log('[getFeaturedApplications] Returning empty array due to API error');
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application> {
  // Call backend directly
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải chi tiết đơn ứng tuyển');
  }
  
  return response.json();
}

