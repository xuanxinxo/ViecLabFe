import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Chỉ xử lý các route admin (UI). API admin tự xử lý xác thực
  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  // Bảo vệ tất cả route admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const hasAdminToken = request.cookies.get('admin-token');
    
    // Log để debug trên production
    console.log(`🔐 [MIDDLEWARE] ${pathname} - Token exists: ${!!hasAdminToken}`);

    // Nếu chưa có token và không phải trang login -> chuyển tới /admin/login
    if (!hasAdminToken && pathname !== '/admin/login') {
      console.log(`🔒 [MIDDLEWARE] Redirecting to login: ${pathname}`);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // Nếu đã có token mà lại vào /admin/login -> chuyển về /admin
    if (hasAdminToken && pathname === '/admin/login') {
      console.log(`✅ [MIDDLEWARE] Already logged in, redirecting to /admin`);
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};