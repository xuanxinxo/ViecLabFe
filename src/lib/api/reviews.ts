import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type ReviewCategory = 'talent' | 'company';

export interface Review {
  id: number;
  category: ReviewCategory;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar?: string;
  dob?: string;
  experience?: number;
  hometown?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewResponse {
  success: boolean;
  data: Review[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getReviews(params?: PaginationParams): Promise<ReviewResponse> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/reviews?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách đánh giá');
  }
  
  return response.json();
}

export async function getFeaturedReviews(limit: number = 5): Promise<Review[]> {
  try {
    const response = await getReviews({
      limit,
      sort: '-createdAt',
      status: 'approved'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    return [];
  }
}

export async function getReviewsByRating(rating: number, category?: ReviewCategory): Promise<Review[]> {
  try {
    const params: any = {
      rating,
      limit: 3
    };
    
    if (category) {
      params.category = category;
    }
    
    const response = await getReviews(params);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews with rating ${rating}:`, error);
    return [];
  }
}
