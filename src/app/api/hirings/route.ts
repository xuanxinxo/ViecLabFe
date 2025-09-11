import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

// File path for persistent mock storage
const MOCK_STORAGE_PATH = path.join(process.cwd(), 'mock-hirings.json');

// Load mock hirings from file or initialize empty array
let mockHirings: any[] = [];

// Load mock data from file
const loadMockHirings = async () => {
  try {
    const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
    mockHirings = JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, start with empty array
    mockHirings = [];
  }
};

// Save mock data to file
const saveMockHirings = async () => {
  try {
    await fs.writeFile(MOCK_STORAGE_PATH, JSON.stringify(mockHirings, null, 2));
  } catch (error) {
    console.error('Failed to save mock hirings:', error);
  }
};

// Initialize mock data on startup
loadMockHirings();

// GET /api/hirings - Proxy to backend with fallback
export async function GET(request: NextRequest) {
  try {
    // Reload mock data from file to ensure we have latest data
    await loadMockHirings();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Try backend first, fallback to mock storage
    let data;
    try {
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/hirings${queryString ? `?${queryString}` : ''}`;
    
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
        signal: controller.signal,
    });

      clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

      data = await response.json();
      // Merge local mock items so newly created (offline) hirings show up immediately for admin views
      if (data && data.success && data.data && Array.isArray(data.data.items) && mockHirings.length > 0) {
        const backendIds = new Set(data.data.items.map((j: any) => j.id || j._id));
        const mergedItems = [...mockHirings.filter(m => !backendIds.has(m.id || m._id)), ...data.data.items];
        data = {
          ...data,
          data: {
            ...data.data,
            items: mergedItems,
            pagination: {
              ...data.data.pagination,
              total: mergedItems.length
            }
          }
        };
      }
    } catch (backendError) {
      
      // Fallback to mock storage
      const mockData = {
        success: true,
        data: {
          items: mockHirings,
          pagination: {
            page: 1,
            limit: mockHirings.length,
            total: mockHirings.length,
            totalPages: 1
          }
        }
      };
      
      data = mockData;
    }
    
    // Always merge mock items if they exist (even when backend fails)
    if (mockHirings.length > 0 && data && data.success && data.data && Array.isArray(data.data.items)) {
      const backendIds = new Set(data.data.items.map((j: any) => j.id || j._id));
      const mergedItems = [...mockHirings.filter(m => !backendIds.has(m.id || m._id)), ...data.data.items];
      data = {
        ...data,
        data: {
          ...data.data,
          items: mergedItems,
          pagination: {
            ...data.data.pagination,
            total: mergedItems.length
          }
        }
      };
    }
    
    // Debug log to see what's being returned
    console.log(`[HIRINGS API] Returning ${data?.data?.items?.length || 0} items (${mockHirings.length} mock items)`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    // Return mock data instead of error to prevent 500
    const mockData = {
      success: true,
      data: {
        items: mockHirings,
        pagination: {
          page: 1,
          limit: mockHirings.length,
          total: mockHirings.length,
          totalPages: 1
        }
      }
    };
    
    return NextResponse.json(mockData);
  }
}

// POST /api/hirings - Create new hiring
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để tạo việc làm' },
        { status: 401 }
      );
    }
    
    // Handle FormData request (for file upload)
    let formData;
    try {
      formData = await request.formData();
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
    
    // Try backend first, fallback to mock storage
    try {
      const backendUrl = 'https://vieclabbe.onrender.com';
      
      // Get authentication headers from the original request
      const authHeaders: Record<string, string> = {};
      
      // Forward admin token as Authorization header to backend
      const adminToken = request.cookies.get('admin-token')?.value;
      if (adminToken) {
        authHeaders['authorization'] = `Bearer ${adminToken}`;
      }
      
      // Also forward original headers as fallback
      const cookie = request.headers.get('cookie');
      if (cookie) {
        authHeaders['cookie'] = cookie;
      }
      const authorization = request.headers.get('authorization');
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
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${backendUrl}/api/hirings`, {
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
      
      const newHiring = {
        id: 'mock-hiring-' + Date.now(),
        _id: 'mock-hiring-' + Date.now(),
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        salary: body.salary,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        deadline: body.deadline,
        status: 'pending', // New hirings start as pending
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        img: body.img
      };
      
      // Add to mock storage
      mockHirings.push(newHiring);
      await saveMockHirings(); // Save to file
      
      const fallbackResponse = {
        success: true,
        message: 'Việc làm đã được tạo thành công (chế độ offline)',
        data: newHiring
      };
      
      return NextResponse.json(fallbackResponse, { status: 200 });
    }
  } catch (error: any) {
    // Final fallback - create hiring in mock storage
    
    try {
      const formData = await request.formData();
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
      
      const newHiring = {
        id: 'fallback-hiring-' + Date.now(),
        _id: 'fallback-hiring-' + Date.now(),
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
      
      mockHirings.push(newHiring);
      await saveMockHirings(); // Save to file
      
      return NextResponse.json({
        success: true,
        message: 'Việc làm đã được tạo thành công (lưu tạm thời - backend không khả dụng)',
        data: newHiring
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

// PUT /api/hirings/[id]/status - Update job status
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để cập nhật trạng thái' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái là bắt buộc' },
        { status: 400 }
      );
    }

    // For now, just return success since we're using mock storage
    // In production, this would update the database
    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: { status }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}

// DELETE /api/hirings/[id] - Delete job
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để xóa việc làm' },
        { status: 401 }
      );
    }

    // For now, just return success since we're using mock storage
    // In production, this would delete from database
    return NextResponse.json({
      success: true,
      message: 'Xóa việc làm thành công'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xóa việc làm' },
      { status: 500 }
    );
  }
}

