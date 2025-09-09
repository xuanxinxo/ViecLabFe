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

  // Use local API proxy instead of direct backend call
  const response = await fetch(`/api/applications?${queryParams.toString()}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải danh sách đơn ứng tuyển');
  }
  
  return response.json();
}

export async function getFeaturedApplications(limit: number = 8): Promise<Application[]> {
  // Use local API proxy instead of direct backend call
  const url = `/api/applications?limit=${limit}`;
  
  console.log(`[getFeaturedApplications] Fetching from: ${url}`);
  
  try {
    const response = await fetch(url, {
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
    console.log('[getFeaturedApplications] API response:', data);
    
    // Handle backend response format: {success: true, count: 29, data: [...]}
    let applications = [];
    if (data.success && Array.isArray(data.data)) {
      applications = data.data;
    } else if (Array.isArray(data)) {
      applications = data;
    } else if (Array.isArray(data?.data)) {
      applications = data.data;
    }
    
    console.log(`[getFeaturedApplications] Found ${applications.length} applications`);
    return applications;
    
  } catch (error) {
    console.error('[getFeaturedApplications] Fetch error:', error);
    // Return mock data for development/demo purposes when backend is unavailable
    console.log('[getFeaturedApplications] Returning mock data due to API error');
    return getMockApplications(limit);
  }
}

export async function getApplicationById(id: string): Promise<Application> {
  // Use local API proxy instead of direct backend call
  const response = await fetch(`/api/applications/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải chi tiết đơn ứng tuyển');
  }
  
  return response.json();
}

// Mock data for development/demo purposes
function getMockApplications(limit: number = 8): Application[] {
  const mockApplications: Application[] = [
    {
      _id: 'mock-1',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      phone: '0901234567',
      message: 'Tôi rất quan tâm đến vị trí này và mong muốn được tham gia team.',
      cv: 'https://example.com/cv/an-nguyen.pdf',
      status: 'pending',
      jobId: 'job-1',
      job: {
        _id: 'job-1',
        title: 'Frontend Developer',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '15-20 triệu',
        type: 'Full-time',
        requirements: ['React', 'TypeScript', 'Next.js'],
        postedDate: '2024-01-15',
        deadline: '2024-02-15'
      },
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      _id: 'mock-2',
      name: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      phone: '0901234568',
      message: 'Tôi có kinh nghiệm 3 năm trong lĩnh vực marketing.',
      cv: 'https://example.com/cv/binh-tran.pdf',
      status: 'approved',
      hiringId: 'hiring-1',
      hiring: {
        _id: 'hiring-1',
        title: 'Marketing Manager',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '20-25 triệu',
        type: 'Full-time',
        requirements: ['Marketing', 'SEO', 'Social Media'],
        postedDate: '2024-01-10',
        deadline: '2024-02-10'
      },
      createdAt: '2024-01-18T14:30:00Z',
      updatedAt: '2024-01-19T09:15:00Z'
    },
    {
      _id: 'mock-3',
      name: 'Lê Văn Cường',
      email: 'cuong.le@email.com',
      phone: '0901234569',
      message: 'Tôi đã từng làm việc trong lĩnh vực tư vấn setup nhà hàng.',
      cv: 'https://example.com/cv/cuong-le.pdf',
      status: 'pending',
      jobId: 'job-2',
      job: {
        _id: 'job-2',
        title: 'Tư vấn Setup Nhà Hàng',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '18-22 triệu',
        type: 'Full-time',
        requirements: ['Kinh nghiệm setup', 'Quản lý dự án', 'Giao tiếp tốt'],
        postedDate: '2024-01-12',
        deadline: '2024-02-12'
      },
      createdAt: '2024-01-22T16:45:00Z',
      updatedAt: '2024-01-22T16:45:00Z'
    },
    {
      _id: 'mock-4',
      name: 'Phạm Thị Dung',
      email: 'dung.pham@email.com',
      phone: '0901234570',
      message: 'Tôi có bằng cử nhân kinh tế và kinh nghiệm 2 năm.',
      cv: 'https://example.com/cv/dung-pham.pdf',
      status: 'approved',
      hiringId: 'hiring-2',
      hiring: {
        _id: 'hiring-2',
        title: 'Business Analyst',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '16-20 triệu',
        type: 'Full-time',
        requirements: ['Phân tích kinh doanh', 'Excel', 'Power BI'],
        postedDate: '2024-01-08',
        deadline: '2024-02-08'
      },
      createdAt: '2024-01-16T11:20:00Z',
      updatedAt: '2024-01-17T13:30:00Z'
    },
    {
      _id: 'mock-5',
      name: 'Hoàng Văn Em',
      email: 'em.hoang@email.com',
      phone: '0901234571',
      message: 'Tôi là developer với 5 năm kinh nghiệm.',
      cv: 'https://example.com/cv/em-hoang.pdf',
      status: 'rejected',
      jobId: 'job-3',
      job: {
        _id: 'job-3',
        title: 'Backend Developer',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '20-25 triệu',
        type: 'Full-time',
        requirements: ['Node.js', 'MongoDB', 'Express'],
        postedDate: '2024-01-05',
        deadline: '2024-02-05'
      },
      createdAt: '2024-01-14T08:15:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: 'mock-6',
      name: 'Võ Thị Phương',
      email: 'phuong.vo@email.com',
      phone: '0901234572',
      message: 'Tôi có kinh nghiệm trong lĩnh vực nhân sự.',
      cv: 'https://example.com/cv/phuong-vo.pdf',
      status: 'pending',
      hiringId: 'hiring-3',
      hiring: {
        _id: 'hiring-3',
        title: 'HR Specialist',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '12-16 triệu',
        type: 'Full-time',
        requirements: ['Quản lý nhân sự', 'Tuyển dụng', 'Đào tạo'],
        postedDate: '2024-01-20',
        deadline: '2024-02-20'
      },
      createdAt: '2024-01-25T15:00:00Z',
      updatedAt: '2024-01-25T15:00:00Z'
    },
    {
      _id: 'mock-7',
      name: 'Đặng Văn Giang',
      email: 'giang.dang@email.com',
      phone: '0901234573',
      message: 'Tôi có kinh nghiệm thiết kế và marketing.',
      cv: 'https://example.com/cv/giang-dang.pdf',
      status: 'approved',
      jobId: 'job-4',
      job: {
        _id: 'job-4',
        title: 'UI/UX Designer',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '14-18 triệu',
        type: 'Full-time',
        requirements: ['Figma', 'Adobe Creative Suite', 'UI/UX'],
        postedDate: '2024-01-18',
        deadline: '2024-02-18'
      },
      createdAt: '2024-01-21T12:30:00Z',
      updatedAt: '2024-01-22T14:45:00Z'
    },
    {
      _id: 'mock-8',
      name: 'Bùi Thị Hoa',
      email: 'hoa.bui@email.com',
      phone: '0901234574',
      message: 'Tôi có kinh nghiệm trong lĩnh vực tài chính.',
      cv: 'https://example.com/cv/hoa-bui.pdf',
      status: 'pending',
      hiringId: 'hiring-4',
      hiring: {
        _id: 'hiring-4',
        title: 'Finance Manager',
        company: 'TOREDCO',
        location: 'Đà Nẵng',
        salary: '22-28 triệu',
        type: 'Full-time',
        requirements: ['Kế toán', 'Tài chính', 'Quản lý ngân sách'],
        postedDate: '2024-01-14',
        deadline: '2024-02-14'
      },
      createdAt: '2024-01-23T09:45:00Z',
      updatedAt: '2024-01-23T09:45:00Z'
    }
  ];

  return mockApplications.slice(0, limit);
}
