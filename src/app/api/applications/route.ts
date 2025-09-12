import { NextRequest, NextResponse } from 'next/server';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/applications - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [APPLICATIONS API] GET request received');
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/applications${queryString ? `?${queryString}` : ''}`;
    
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
    
    const response = NextResponse.json(data);
    return addCorsHeaders(response);
  } catch (error: any) {
    console.error('💥 [APPLICATIONS API] Error:', error);
    
    const response = NextResponse.json(
      { 
        success: false,
        data: [],
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST /api/applications - Proxy to backend
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/applications`, {
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
    const response = NextResponse.json(data, { status: response.status });
    return addCorsHeaders(response);
  } catch (error) {
    const response = NextResponse.json({ error: 'Server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

