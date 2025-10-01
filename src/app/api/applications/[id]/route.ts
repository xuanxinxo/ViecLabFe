import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/applications/[id] - Proxy to backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [APPLICATIONS API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/applications/${params.id}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const fetchResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`Backend API error: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    console.log('Backend response data:', data);
    
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  } catch (error: any) {
    console.error('💥 [APPLICATIONS API] Error:', error);
    
    const response = NextResponse.json(
      { 
        success: false,
        data: null,
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}

// DELETE /api/applications/[id] - Proxy to backend
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [APPLICATIONS API] DELETE request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/applications/${params.id}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const fetchResponse = await fetch(backendApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`Backend API error: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    console.log('Backend response data:', data);
    
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  } catch (error: any) {
    console.error('💥 [APPLICATIONS API] Error:', error);
    
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

