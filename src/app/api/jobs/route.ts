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
    
    // Handle JSON request
    console.log('🔍 [JOBS API] Processing JSON request');
    const body = await req.json();
    console.log('🔍 [JOBS API] JSON parsed:', body);
    
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
    
    const response = await fetch(`${backendUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(body),
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