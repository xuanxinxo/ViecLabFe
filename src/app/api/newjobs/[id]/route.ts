import { NextRequest, NextResponse } from 'next/server';
import { normalizeApiResponse, createErrorResponse } from '@/lib/apiResponseNormalizer';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET /api/newjobs/[id] - Proxy to backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [NEWJOBS API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/newjobs/${params.id}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    // For single item, return the data directly without normalization
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    
    const response = NextResponse.json(
      createErrorResponse('Không thể tải dữ liệu từ server');
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;,
      { status: 500 }
    );
  }
}

// DELETE /api/newjobs/[id] - Proxy to backend
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [NEWJOBS API] DELETE request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/newjobs/${params.id}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const response = await fetch(backendApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    
    const response = NextResponse.json(
      { 
        success: false,
        message: 'Không thể xóa dữ liệu từ server'
      },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}