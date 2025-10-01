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

// GET /api/applications
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [APPLICATIONS API] GET request received');

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/applications${queryString ? `?${queryString}` : ''}`;

    console.log(`Calling backend API: ${backendApiUrl}`);

    const backendResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    console.log('Backend response data:', data);

    const nextResponse = NextResponse.json(data, { status: 200 });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return nextResponse;
  } catch (error: any) {
    console.error('💥 [APPLICATIONS API] Error:', error);

    const errorResponse = NextResponse.json(
      {
        success: false,
        data: [],
        message: 'Không thể tải dữ liệu từ server',
      },
      { status: 500 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return errorResponse;
  }
}

// POST /api/applications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = 'https://vieclabbe.onrender.com';

    const backendResponse = await fetch(`${backendUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    const nextResponse = NextResponse.json(data, { status: backendResponse.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return nextResponse;
  } catch (error) {
    const errorResponse = NextResponse.json({ error: 'Server error' }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return errorResponse;
  }
}


