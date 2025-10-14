import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');

export interface NewsItem {
  _id: string;
  title: string;
  summary?: string;
  image: string;
  date?: string;
  link?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getNews(params?: PaginationParams): Promise<PaginatedResponse<NewsItem>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  // Use local API route instead of backend directly
  const response = await fetch(`/api/news?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách tin tức');
  }
  
  return response.json();
}

export async function getFeaturedNews(limit: number = 5, _cacheBuster?: number): Promise<NewsItem[]> {
  try {
    console.log('[getFeaturedNews] Fetching from backend...');
    
    // Call backend directly
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      status: 'published',
      sort: '-createdAt'
    });
    if (_cacheBuster) {
      queryParams.append('_t', _cacheBuster.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/api/news?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[getFeaturedNews] Backend response:', data);
    
    // Handle backend response format: { success: true, data: { items: [...], pagination: {...} } }
    let items: any[] = [];
    if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
      items = data.data.items;
      console.log(`[getFeaturedNews] Using data.data.items: ${items.length} items`);
    } else if (data.data && Array.isArray(data.data)) {
      items = data.data;
      console.log(`[getFeaturedNews] Using data.data: ${items.length} items`);
    } else if (Array.isArray(data)) {
      items = data;
      console.log(`[getFeaturedNews] Using direct array: ${items.length} items`);
    } else {
      console.warn('[getFeaturedNews] No valid news data found in response:', data);
      items = [];
    }

    // Đảm bảo mỗi phần tử có trường cần thiết và map an toàn
    return (items || [])
      .filter(Boolean)
      .map((it: any) => ({
        _id: it._id || it.id || cryptoRandomId(),
        title: it.title || it.headline || 'Không có tiêu đề',
        summary: it.summary || it.description || '',
        image: it.image || it.imageUrl || it.thumbnail || '/reparo-logo.png',
        date: it.date || it.publishedAt || it.createdAt,
        link: it.link,
        content: it.content,
        author: it.author,
        category: it.category,
        tags: it.tags,
        isFeatured: it.isFeatured,
        status: it.status,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      }));
  } catch (error) {
    console.error('Error fetching featured news:', error);
    return [];
  }
}

function cryptoRandomId(): string {
  try {
    // @ts-ignore - browser crypto may be available
    const arr = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(8)) : null;
    if (arr) return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  } catch {}
  return Math.random().toString(36).slice(2, 10);
}

export async function getNewsDetail(id: string): Promise<NewsItem> {
  // Use local API route instead of backend directly
  const response = await fetch(`/api/news/${id}`);
  if (!response.ok) {
    throw new Error('Không thể tải chi tiết tin tức');
  }
  return response.json();
}
