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

// GET /api/newjobs - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [NEWJOBS API] GET request received');
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/newjobs${queryString ? `?${queryString}` : ''}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const backendResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    console.log('Backend response data:', data);
    
    const res = NextResponse.json(data, { status: backendResponse.status });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    
    const res = NextResponse.json(
      { 
        success: false,
        data: [],
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
}

// POST /api/newjobs - Proxy to backend
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendResponse = await fetch(`${backendUrl}/api/newjobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    const res = NextResponse.json(data, { status: backendResponse.status });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  } catch (error) {
    const res = NextResponse.json({ error: 'Server error' }, { status: 500 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
}
