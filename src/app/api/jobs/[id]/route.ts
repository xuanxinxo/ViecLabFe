import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// GET /api/jobs/[id] - Proxy to backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [JOBS API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/jobs/${params.id}`;
    
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
        data: null,
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
  }
}

