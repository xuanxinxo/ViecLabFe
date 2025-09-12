import { NextRequest, NextResponse } from 'next/server';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      const response = NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp địa chỉ email' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Call the backend API to process the forgot password request
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      const response = NextResponse.json(
        { success: false, message: data.message || 'Có lỗi xảy ra khi xử lý yêu cầu' },
        { status: response.status }
      );
    return addCorsHeaders(response);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn',
    });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
