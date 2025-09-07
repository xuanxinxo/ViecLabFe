import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp địa chỉ email' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, message: data.message || 'Có lỗi xảy ra khi xử lý yêu cầu' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
