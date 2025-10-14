import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra nếu đang truy cập admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Cho phép API admin xử lý auth riêng
    if (request.nextUrl.pathname.startsWith('/api/admin/')) {
      return NextResponse.next();
    }

    const hasAdminToken = request.cookies.get('admin-token');

    // Nếu chưa đăng nhập và không ở trang login -> bắt buộc chuyển đến /admin/login
    if (!hasAdminToken && request.nextUrl.pathname !== '/admin/login') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // Nếu đã đăng nhập mà vào trang /admin/login -> chuyển về /admin
    if (hasAdminToken && request.nextUrl.pathname === '/admin/login') {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }

    // Các trang admin khác vẫn cho phép truy cập, phần bảo vệ sẽ làm ở API hoặc từng trang nếu cần
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 