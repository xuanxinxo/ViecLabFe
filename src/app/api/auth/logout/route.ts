import { NextRequest, NextResponse } from 'next/server';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [LOGOUT] API called');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    console.log('🍪 [LOGOUT] Cookie cleared successfully');

    return response;

  } catch (error) {
    console.error('❌ [LOGOUT] Server error:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Có lỗi xảy ra khi đăng xuất',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
