import { PaginationParams, PaginatedResponse } from '@/src/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

  const response = await fetch(`${API_BASE_URL}/api/news?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Không thể tải danh sách tin tức');
  }
  
  return response.json();
}

export async function getFeaturedNews(limit: number = 5, _cacheBuster?: number): Promise<NewsItem[]> {
  try {
    const params: any = {
      limit,
      isFeatured: 'true',
      status: 'published'
    };
    if (_cacheBuster) {
      params._t = _cacheBuster;
    }
    const response = await getNews(params);
    // Chuẩn hóa nhiều dạng response khác nhau
    let items: any[] = [];
    if (Array.isArray(response)) items = response;
    else if (Array.isArray((response as any)?.data)) items = (response as any).data;
    else if (Array.isArray((response as any)?.news)) items = (response as any).news;

    // Nếu featured rỗng, fallback: lấy tin mới nhất (published)
    if (!items || items.length === 0) {
      const fallback = await getNews({ limit, status: 'published', sort: '-createdAt', _t: _cacheBuster });
      if (Array.isArray(fallback)) items = fallback;
      else if (Array.isArray((fallback as any)?.data)) items = (fallback as any).data;
      else if (Array.isArray((fallback as any)?.news)) items = (fallback as any).news;
      else items = [];
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
  const response = await fetch(`${API_BASE_URL}/api/news/${id}`);
  if (!response.ok) {
    throw new Error('Không thể tải chi tiết tin tức');
  }
  return response.json();
}
