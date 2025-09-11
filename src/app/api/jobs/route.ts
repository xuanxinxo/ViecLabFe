import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// Temporary storage for mock jobs (in production, this would be a database)
let mockJobs: any[] = [];

// GET /api/jobs - Return mock jobs for testing
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const referer = request.headers.get('referer') || '';
    const isAdmin = referer.includes('/admin/') || request.url.includes('/admin/');
    
    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    const backendUrl = `https://vieclabbe.onrender.com/api/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Try backend API first, fallback to mock storage
    let data;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }
      
      data = await response.json();
    } catch (backendError) {
      // Fallback to mock storage
      const mockData = {
        success: true,
        data: {
          items: mockJobs,
          pagination: {
            page: 1,
            limit: mockJobs.length,
            total: mockJobs.length,
            totalPages: 1
          }
        }
      };
      
      data = mockData;
    }
    
    // Filter jobs based on context if needed
    let filteredData = data;
    
    if (data.success && data.data && data.data.items) {
      let filteredJobs = data.data.items;
      
      if (!isAdmin) {
        // For public pages, only show active jobs
        filteredJobs = data.data.items.filter((job: any) => job.status === 'active');
        console.log('🔍 [JOBS API] Filtered for public (active only):', filteredJobs.length);
      } else if (status) {
        // For admin pages, filter by specific status if provided
        filteredJobs = data.data.items.filter((job: any) => job.status === status);
        console.log(`🔍 [JOBS API] Filtered for admin (status: ${status}):`, filteredJobs.length);
      }
      
      filteredData = {
        ...data,
        data: {
          ...data.data,
          items: filteredJobs,
          pagination: {
            ...data.data.pagination,
            total: filteredJobs.length
          }
        }
      };
    }
    
    return NextResponse.json(filteredData);
  } catch (error: any) {
    // Return mock data instead of error to prevent 500
    const mockData = {
      success: true,
      data: {
        items: mockJobs,
        pagination: {
          page: 1,
          limit: mockJobs.length,
          total: mockJobs.length,
          totalPages: 1
        }
      }
    };
    
    return NextResponse.json(mockData);
  }
}

// POST /api/jobs - Proxy to backend
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để tạo việc làm' },
        { status: 401 }
      );
    }
    
    // Handle FormData request (for file upload)
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      return NextResponse.json(
        { success: false, message: 'Lỗi xử lý dữ liệu form' },
        { status: 400 }
      );
    }
    
    // Extract form fields
    const body = {
      title: formData.get('title')?.toString() || '',
      company: formData.get('company')?.toString() || '',
      location: formData.get('location')?.toString() || '',
      type: formData.get('type')?.toString() || '',
      salary: formData.get('salary')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      requirements: formData.getAll('requirements').map(r => r.toString()).filter(r => r.trim()),
      benefits: formData.getAll('benefits').map(b => b.toString()).filter(b => b.trim()),
      deadline: formData.get('deadline')?.toString() || '',
      img: formData.get('img') ? 'uploaded_image' : ''
    };
    
    // Validate required fields
    if (!body.title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề việc làm là bắt buộc' },
        { status: 400 }
      );
    }
    if (!body.company.trim()) {
      return NextResponse.json(
        { success: false, message: 'Tên công ty là bắt buộc' },
        { status: 400 }
      );
    }
    if (!body.location.trim()) {
      return NextResponse.json(
        { success: false, message: 'Địa điểm làm việc là bắt buộc' },
        { status: 400 }
      );
    }
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = req.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
    }
    
    // Also forward original headers as fallback
    const cookie = req.headers.get('cookie');
    if (cookie) {
      authHeaders['cookie'] = cookie;
    }
    const authorization = req.headers.get('authorization');
    if (authorization) {
      authHeaders['authorization'] = authorization;
    }
    
    // Create FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('title', body.title);
    backendFormData.append('company', body.company);
    backendFormData.append('location', body.location);
    backendFormData.append('type', body.type);
    backendFormData.append('salary', body.salary);
    backendFormData.append('description', body.description);
    backendFormData.append('deadline', body.deadline);
    
    // Add requirements and benefits
    body.requirements.forEach(req => backendFormData.append('requirements', req));
    body.benefits.forEach(ben => backendFormData.append('benefits', ben));
    
    // Add image if exists
    const imageFile = formData.get('img') as File | null;
    if (imageFile && imageFile.size > 0) {
      backendFormData.append('img', imageFile);
    }
    
    // Try backend first, fallback to mock storage if backend fails
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${backendUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          ...authHeaders
          // Don't set Content-Type for FormData, let runtime set it with boundary
        },
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Only fallback for server errors (5xx), not client errors (4xx)
        if (response.status >= 500) {
          throw new Error(`Backend server error: ${response.status} - ${errorText}`);
        } else {
          // For client errors (4xx), return the error directly
          return NextResponse.json(
            { success: false, message: `Lỗi từ server: ${errorText}` },
            { status: response.status }
          );
        }
      }

      const data = await response.json();
      // Ensure consistent response shape
      return NextResponse.json(
        data.success ? data : { success: true, message: 'Tạo việc làm thành công', data },
        { status: response.status || 201 }
      );
      
    } catch (backendError: any) {
      // Only fallback to mock storage for network errors or server errors (5xx)
      console.error('❌ Backend connection error:', backendError.message);
      
      // Check if it's a network error or server error
      const isNetworkError = backendError.name === 'AbortError' || 
                            backendError.message.includes('fetch') ||
                            backendError.message.includes('network') ||
                            backendError.message.includes('timeout');
      
      const isServerError = backendError.message.includes('Backend server error');
      
      if (!isNetworkError && !isServerError) {
        // For other errors, return the error directly
        return NextResponse.json(
          { success: false, message: `Lỗi kết nối: ${backendError.message}` },
          { status: 500 }
        );
      }
      
      // Fallback to mock storage only for network/server errors
      
      const newJob = {
        id: 'mock-job-' + Date.now(),
        _id: 'mock-job-' + Date.now(),
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        salary: body.salary,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        deadline: body.deadline,
        status: 'pending', // New jobs start as pending
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        img: body.img
      };
      
      // Add to mock storage
      mockJobs.push(newJob);
      
      const fallbackResponse = {
        success: true,
        message: 'Việc làm đã được tạo thành công (chế độ offline)',
        data: newJob
      };
      
      return NextResponse.json(fallbackResponse, { status: 200 });
    }
  } catch (error: any) {
    // Final fallback - create job in mock storage
    
    try {
      const formData = await req.formData();
      const body = {
        title: formData.get('title')?.toString() || '',
        company: formData.get('company')?.toString() || '',
        location: formData.get('location')?.toString() || '',
        type: formData.get('type')?.toString() || '',
        salary: formData.get('salary')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        requirements: formData.getAll('requirements').map(r => r.toString()).filter(r => r.trim()),
        benefits: formData.getAll('benefits').map(b => b.toString()).filter(b => b.trim()),
        deadline: formData.get('deadline')?.toString() || '',
        img: formData.get('img') ? 'uploaded_image' : ''
      };
      
      const newJob = {
        id: 'fallback-job-' + Date.now(),
        _id: 'fallback-job-' + Date.now(),
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        salary: body.salary,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        deadline: body.deadline,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        img: body.img
      };
      
      mockJobs.push(newJob);
      
      return NextResponse.json({
        success: true,
        message: 'Việc làm đã được tạo thành công (lưu tạm thời - backend không khả dụng)',
        data: newJob
      }, { status: 200 });
      
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Có lỗi xảy ra khi tạo việc làm. Vui lòng thử lại sau.',
          error: error.message
        },
        { status: 500 }
      );
    }
  }
}

// PUT /api/jobs - Update job
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    console.log('🔍 [JOBS API] PUT request for job:', id, 'with data:', updateData);
    
    // Find and update job in mock storage
    const jobIndex = mockJobs.findIndex(job => job.id === id || job._id === id);
    
    if (jobIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy việc làm' 
      }, { status: 404 });
    }
    
    // Update job
    mockJobs[jobIndex] = {
      ...mockJobs[jobIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ [JOBS API] Job updated successfully:', mockJobs[jobIndex]);
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật việc làm thành công',
      data: mockJobs[jobIndex]
    }, { status: 200 });
  } catch (error) {
    console.error('💥 [JOBS API] PUT Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi cập nhật việc làm' 
    }, { status: 500 });
  }
}

// DELETE /api/jobs - Delete job
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    const cookie = req.headers.get('cookie');
    if (cookie) {
      authHeaders['cookie'] = cookie;
    }
    const authorization = req.headers.get('authorization');
    if (authorization) {
      authHeaders['authorization'] = authorization;
    }
    
    const response = await fetch(`${backendUrl}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}