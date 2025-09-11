import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { normalizeApiResponse, createErrorResponse } from '@/lib/apiResponseNormalizer';

export const dynamic = "force-dynamic";

// GET /api/jobs/[id] - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [JOBS ID API] GET request received for job:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
      console.log('🔍 [JOBS ID API] Forwarding admin token to backend');
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
    
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
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
    console.log('✅ [JOBS ID API] Job retrieved successfully:', data);
    
    // For single item, return the data directly without normalization
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('💥 [JOBS ID API] Error:', error);
    
    return NextResponse.json(
      createErrorResponse('Không thể tải thông tin việc làm'),
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [JOBS ID API] PUT request received for job:', params.id);
    
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      console.log('❌ [JOBS ID API] No admin authentication found');
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để cập nhật việc làm' },
        { status: 401 }
      );
    }
    
    console.log('✅ [JOBS ID API] Admin authenticated:', admin.username);
    
    // Check if request contains FormData (file upload)
    const contentType = request.headers.get('content-type') || '';
    console.log('🔍 [JOBS ID API] Content-Type:', contentType);
    console.log('🔍 [JOBS ID API] All headers:', Object.fromEntries(request.headers.entries()));
    
    let body: any;
    let headers: Record<string, string> = {};
    
    // Try to detect FormData by checking if content-type contains multipart
    // or by trying to parse as FormData first
    try {
      if (contentType.includes('multipart/form-data')) {
        // Handle file upload with FormData
        console.log('🔍 [JOBS ID API] Processing FormData request');
        body = await request.formData();
        
        // Log FormData contents for debugging
        console.log('🔍 [JOBS ID API] FormData keys:', Array.from(body.keys()));
        for (const [key, value] of body.entries()) {
          if (value instanceof File) {
            console.log(`🔍 [JOBS ID API] File field: ${key}, size: ${value.size}, type: ${value.type}`);
          } else {
            console.log(`🔍 [JOBS ID API] Text field: ${key} = ${value}`);
          }
        }
        
        // Don't set Content-Type header for FormData, let fetch set it automatically
      } else {
        // Handle JSON request
        console.log('🔍 [JOBS ID API] Processing JSON request');
        body = await request.json();
        headers['Content-Type'] = 'application/json';
      }
    } catch (error) {
      console.error('💥 [JOBS ID API] Error parsing request body:', error);
      
      // If JSON parsing fails, try FormData as fallback
      try {
        console.log('🔄 [JOBS ID API] JSON parsing failed, trying FormData...');
        body = await request.formData();
        console.log('✅ [JOBS ID API] Successfully parsed as FormData');
      } catch (formDataError) {
        console.error('💥 [JOBS ID API] FormData parsing also failed:', formDataError);
        throw new Error('Cannot parse request body as JSON or FormData');
      }
    }
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
      console.log('🔍 [JOBS ID API] Forwarding admin token to backend');
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
    
    // Prepare request body
    let requestBody: any;
    if (body instanceof FormData) {
      requestBody = body;
      console.log('🔍 [JOBS ID API] Using FormData as request body');
    } else {
      requestBody = JSON.stringify(body);
      console.log('🔍 [JOBS ID API] Using JSON as request body');
    }
    
    console.log('🔍 [JOBS ID API] Calling backend with:', {
      method: 'PUT',
      url: `${backendUrl}/api/jobs/${params.id}`,
      hasFormData: body instanceof FormData,
      authHeaders: Object.keys(authHeaders),
      requestHeaders: Object.keys(headers)
    });
    
    try {
      // Log final request details
      console.log('🔍 [JOBS ID API] Final request details:', {
        url: `${backendUrl}/api/jobs/${params.id}`,
        method: 'PUT',
        headers: {
          ...headers,
          ...authHeaders
        },
        bodyType: body instanceof FormData ? 'FormData' : 'JSON',
        bodySize: body instanceof FormData ? 'FormData with files' : JSON.stringify(body).length + ' chars'
      });
      
      const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          ...authHeaders
        },
        body: requestBody,
      });

      console.log('🔍 [JOBS ID API] Backend response status:', response.status);
      console.log('🔍 [JOBS ID API] Backend response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [JOBS ID API] Backend error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: `${backendUrl}/api/jobs/${params.id}`,
          requestMethod: 'PUT',
          requestBodyType: body instanceof FormData ? 'FormData' : 'JSON'
        });
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ [JOBS ID API] Parsed error data:', errorData);
        } catch (parseError) {
          console.error('❌ [JOBS ID API] Could not parse error response as JSON');
        }
        
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ [JOBS ID API] Job updated successfully:', data);
      
      return NextResponse.json(data, { status: response.status });
      
    } catch (fetchError) {
      console.error('💥 [JOBS ID API] Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error: any) {
    console.error('💥 [JOBS ID API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Không thể cập nhật việc làm: ' + error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [JOBS ID API] DELETE request received for job:', params.id);
    
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      console.log('❌ [JOBS ID API] No admin authentication found');
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để xóa việc làm' },
        { status: 401 }
      );
    }
    
    console.log('✅ [JOBS ID API] Admin authenticated:', admin.username);
    
    if (!params.id) {
      console.log('❌ [JOBS ID API] No job ID provided');
      return NextResponse.json(
        { 
          success: false,
          message: 'Job ID is required'
        },
        { status: 400 }
      );
    }
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/jobs/${params.id}`;
    
    console.log('🔍 [JOBS ID API] Calling backend API:', backendApiUrl);
    
    // Get authentication headers from the original request
    const authHeaders: Record<string, string> = {};
    
    // Forward admin token as Authorization header to backend
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      authHeaders['authorization'] = `Bearer ${adminToken}`;
      console.log('🔍 [JOBS ID API] Forwarding admin token to backend');
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

    // Try DELETE method first
    let response = await fetch(backendApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });

    console.log('🔍 [JOBS ID API] Backend DELETE response status:', response.status);

    // If DELETE method is not supported (405), try PUT with status 'deleted'
    if (response.status === 405 || response.status === 501) {
      console.log('🔄 [JOBS ID API] DELETE not supported, trying PUT with status deleted');
      
      response = await fetch(backendApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ status: 'deleted' }),
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('🔍 [JOBS ID API] Backend PUT response status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [JOBS ID API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Không tìm thấy việc làm để xóa'
          },
          { status: 404 }
        );
      } else if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Không có quyền xóa việc làm này'
          },
          { status: 403 }
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
    console.log('✅ [JOBS ID API] Job deleted successfully:', data);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Xóa việc làm thành công',
        data: data
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 [JOBS ID API] Error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          message: 'Request timeout. Server đang phản hồi chậm.'
        },
        { status: 408 }
      );
    } else if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Có lỗi xảy ra khi xóa việc làm. Vui lòng thử lại sau.'
      },
      { status: 500 }
    );
  }
}   