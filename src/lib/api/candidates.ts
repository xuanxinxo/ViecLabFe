import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

  // Prefer backend if available, but fall back to Next route if 404/failed
  const backendUrl = API_BASE_URL ? `${API_BASE_URL}/api/candidates?${queryParams.toString()}` : '';
  const nextUrl = `/api/candidates?${queryParams.toString()}`;

  let res: Response | null = null;
  try {
    if (backendUrl) {
      res = await fetch(backendUrl);
      if (res.ok) return res.json();
    }
  } catch {}

  // Fallback to Next.js API route
  res = await fetch(nextUrl);
  if (!res.ok) {
    throw new Error('Không thể tải danh sách ứng viên');
  }
  return res.json();
}

export async function getCandidateDetail(id: string): Promise<Candidate> {
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
