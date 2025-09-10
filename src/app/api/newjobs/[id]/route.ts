import { NextRequest, NextResponse } from 'next/server';
import { normalizeApiResponse, createErrorResponse } from '@/lib/apiResponseNormalizer';

export const dynamic = "force-dynamic";

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
    
    // Normalize response format to ensure consistency
    const normalizedResponse = normalizeApiResponse(data, 'Lấy dữ liệu việc làm mới thành công');
    
    return NextResponse.json(normalizedResponse);
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    
    return NextResponse.json(
      createErrorResponse('Không thể tải dữ liệu từ server'),
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
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('💥 [NEWJOBS API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Không thể xóa dữ liệu từ server'
      },
      { status: 500 }
    );
  }
}