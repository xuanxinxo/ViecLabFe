import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');

export interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  location?: string;
  about?: string;
  avatar?: string;
  resumeUrl?: string;
  status?: string;
  hiring?: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    type?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export async function getCandidates(params?: PaginationParams): Promise<PaginatedResponse<Candidate>> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Use backend API directly
  const response = await fetch(`${API_BASE_URL}/api/candidates?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách ứng viên');
  }
  return response.json();
}

export async function getCandidateDetail(id: string): Promise<Candidate> {
  // Use backend API directly
  const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`);
  if (!response.ok) {
    throw new Error('Không thể tải chi tiết ứng viên');
  }
  return response.json();
}

export async function getFeaturedCandidates(limit: number = 8): Promise<Candidate[]> {
  try {
    const response = await getCandidates({
      limit,
      status: 'active',
      sort: '-createdAt'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured candidates:', error);
    return [];
  }
}
