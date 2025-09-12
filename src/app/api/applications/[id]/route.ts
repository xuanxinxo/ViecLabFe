import { NextRequest, NextResponse } from 'next/server';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/applications/[id] - Proxy to backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 [APPLICATIONS API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/applications/${params.id}`;
    
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
        data: null,
        message: 'Không thể tải dữ liệu từ server'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
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
    return addCorsHeaders(response);
  } catch (error: any) {
    console.error('💥 [APPLICATIONS API] Error:', error);
    
    const response = NextResponse.json(
      { 
        success: false,
        message: 'Không thể xóa dữ liệu từ server'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

