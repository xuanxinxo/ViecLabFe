import { NextRequest, NextResponse } from 'next/server';
import { serverCookieHelper } from '@/lib/cookieHelper';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear admin token from cookies
    serverCookieHelper.deleteTokenFromResponse(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
