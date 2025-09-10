import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET /api/jobs - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [JOBS API] GET request received');
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/jobs${queryString ? `?${queryString}` : ''}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    const cookie = request.headers.get('cookie');
    if (cookie) {
      authHeaders['cookie'] = cookie;
    }
    const authorization = request.headers.get('authorization');
    if (authorization) {
      authHeaders['authorization'] = authorization;
    }

    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('💥 [JOBS API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        data: [],
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Proxy to backend
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 [JOBS API] POST request received');
    
    // Check admin authentication
    const admin = getAdminFromRequest(req);
    if (!admin) {
      console.log('❌ [JOBS API] No admin authentication found');
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để tạo việc làm' },
        { status: 401 }
      );
    }
    
    console.log('✅ [JOBS API] Admin authenticated:', admin.username);
    
    // Handle FormData request (for file upload)
    console.log('🔍 [JOBS API] Processing FormData request');
    const formData = await req.formData();
    
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
    
    console.log('🔍 [JOBS API] FormData parsed:', body);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = req.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
      console.log('🔍 [JOBS API] Forwarding admin token to backend');
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
    
    console.log('🔍 [JOBS API] Calling backend POST API with auth headers');
    
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
    
    const response = await fetch(`${backendUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        ...authHeaders
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: backendFormData,
    });

    console.log('🔍 [JOBS API] Backend POST response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [JOBS API] POST Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Không có quyền tạo việc làm'
          },
          { status: 403 }
        );
      } else if (response.status === 400) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Dữ liệu không hợp lệ'
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { 
            success: false,
            message: `Lỗi server: ${response.status} - ${response.statusText}`
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('✅ [JOBS API] Job created successfully:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('💥 [JOBS API] POST Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Có lỗi xảy ra khi tạo việc làm'
      },
      { status: 500 }
    );
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(updateData),
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