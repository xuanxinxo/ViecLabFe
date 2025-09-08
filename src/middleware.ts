import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra nếu đang truy cập admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Bỏ qua tất cả admin routes - cho phép truy cập mà không cần authentication
    // Chỉ bỏ qua API routes vì chúng cần xử lý riêng
    if (request.nextUrl.pathname.startsWith('/api/admin/')) {
      return NextResponse.next();
    }

    // Cho phép truy cập tất cả admin pages mà không cần authentication
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 