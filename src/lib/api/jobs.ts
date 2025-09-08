import { Job, PaginationParams, PaginatedResponse } from '../../types/job';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');



/**
 * Lấy danh sách công việc
 */
export async function getJobs(params?: PaginationParams): Promise<PaginatedResponse<Job>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Use Next.js API route
  const response = await fetch(`/api/jobs?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách công việc');
  }
  
  return response.json();
}

/**
 * Lấy danh sách công việc mới
 */
export async function getNewJobs(params?: PaginationParams): Promise<PaginatedResponse<Job>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Use Next.js API route
  const response = await fetch(`/api/newjobs?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách công việc mới');
  }
  
  return response.json();
}

/**
 * Lấy danh sách việc làm đã phê duyệt
 */
export async function getHiringJobs(params?: PaginationParams): Promise<PaginatedResponse<Job>> {
  const queryParams = new URLSearchParams({ status: 'approved' });
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Use Next.js API route
  const response = await fetch(`/api/hirings?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách việc làm');
  }
  
  return response.json();
}

/**
 * Lấy chi tiết công việc
 */
export async function getJobDetail(id: string): Promise<Job> {
  // Use Next.js API route
  const response = await fetch(`/api/jobs/${id}`);
  if (!response.ok) {
    throw new Error('Không thể tải chi tiết công việc');
  }
  
  return response.json();
}
