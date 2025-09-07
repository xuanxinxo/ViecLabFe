import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra nếu đang truy cập admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Bỏ qua trang login và tất cả API routes
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname.startsWith('/api/admin/')) {
      return NextResponse.next();
    }

    // Kiểm tra token trong cookie hoặc header
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect đến trang login nếu không có token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Nếu có token, cho phép truy cập (không cần verify ở đây)
    // Token sẽ được verify trong các API routes cụ thể
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 