import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// PUT /api/jobs/[id]/status - Update job status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [JOBS STATUS API] PUT request received for job:', params.id);
    
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      console.log('❌ [JOBS STATUS API] No admin authentication found');
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để cập nhật trạng thái việc làm' },
        { status: 401 }
      );
    }
    
    console.log('✅ [JOBS STATUS API] Admin authenticated:', admin.username);
    
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
      console.log('🔍 [JOBS STATUS API] Forwarding admin token to backend');
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
    
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [JOBS STATUS API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Không có quyền cập nhật trạng thái việc làm này'
          },
          { status: 403 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Không tìm thấy việc làm để cập nhật'
          },
          { status: 404 }
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
    console.log('✅ [JOBS STATUS API] Status updated successfully:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('💥 [JOBS STATUS API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Không thể cập nhật trạng thái việc làm'
      },
      { status: 500 }
    );
  }
}
