import { NextRequest, NextResponse } from 'next/server';
import { normalizeApiResponse, createErrorResponse } from '@/lib/apiResponseNormalizer';

export const dynamic = "force-dynamic";

// GET /api/hirings/[id] - Proxy to backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [HIRINGS API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/hirings/${params.id}`;
    
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
    
    // Normalize response format to ensure consistency
    const normalizedResponse = normalizeApiResponse(data, 'Lấy dữ liệu việc làm thành công');
    
    return NextResponse.json(normalizedResponse);
  } catch (error: any) {
    console.error('💥 [HIRINGS API] Error:', error);
    
    return NextResponse.json(
      createErrorResponse('Không thể tải dữ liệu từ server'),
      { status: 500 }
    );
  }
}

