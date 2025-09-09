import { NextRequest, NextResponse } from 'next/server';

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
    const body = await req.json();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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