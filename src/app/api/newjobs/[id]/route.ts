import { NextRequest, NextResponse } from 'next/server';
import { normalizeApiResponse, createErrorResponse } from '@/lib/apiResponseNormalizer';

export const dynamic = "force-dynamic";

function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

// GET /api/newjobs/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [NEWJOBS API] GET request for ID:', params.id);

    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/newjobs/${params.id}`;
    console.log(`Calling backend API: ${backendApiUrl}`);

    const apiRes = await fetch(backendApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!apiRes.ok) {
      throw new Error(`Backend API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();
    console.log('Backend response data:', data);

    // Trả về trực tiếp data
    return withCORS(NextResponse.json(data));
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    return withCORS(
      NextResponse.json(createErrorResponse('Không thể tải dữ liệu từ server'), { status: 500 })
    );
  }
}

// DELETE /api/newjobs/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [NEWJOBS API] DELETE request for ID:', params.id);

    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/newjobs/${params.id}`;
    console.log(`Calling backend API: ${backendApiUrl}`);

    const apiRes = await fetch(backendApiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!apiRes.ok) {
      throw new Error(`Backend API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();
    console.log('Backend response data:', data);

    return withCORS(NextResponse.json(data));
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    return withCORS(
      NextResponse.json(
        { success: false, message: 'Không thể xóa dữ liệu từ server' },
        { status: 500 }
      )
    );
  }
}
