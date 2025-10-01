// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, checkRateLimit } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { serverCookieHelper } from '@/lib/cookieHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const JWT_SECRET = process.env.JWT_SECRET || 'toredco-admin-secret-key-2024-super-secure';

/* POST /api/admin/login */
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [ADMIN LOGIN] API called');
    
    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`admin-login-${clientIP}`, 20, 300000)) { // 20 attempts per 5 minutes (increased for testing)
      console.log('❌ [ADMIN LOGIN] Rate limit exceeded for IP:', clientIP);
      const response = NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }
    
    const { username, password } = await request.json();
    console.log('📝 [ADMIN LOGIN] Received credentials:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ [ADMIN LOGIN] Missing username or password');
      const response = NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 },
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    /* 1. Xác thực admin */
    console.log('🔍 [ADMIN LOGIN] Authenticating user:', username);
    const user = authenticateAdmin(username, password);
    
    if (!user) {
      console.log('❌ [ADMIN LOGIN] Authentication failed for username:', username);
      console.log('🔍 [ADMIN LOGIN] Available users:', ['admin', 'admin2', 'admin3']);
      const response = NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    console.log('✅ [ADMIN LOGIN] Authentication successful for user:', user.username);

    /* 2. Tạo JWT */
    console.log('🔑 [ADMIN LOGIN] Creating JWT token for user:', user.userId);
    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    console.log('🔑 [ADMIN LOGIN] JWT token created successfully');

    /* 3. Trả response + set cookie */
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken: token,
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role,
        },
      },
      message: 'Login successful',
    });

    // Set cookie
    console.log('🍪 [ADMIN LOGIN] Setting cookie');
    serverCookieHelper.setTokenToResponse(response, token);

    console.log('✅ [ADMIN LOGIN] Login completed successfully');
    return response;
  } catch (err) {
    console.error('💥 [ADMIN LOGIN] Error:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}

/* OPTIONS cho CORS pre-flight */
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}
