// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, checkRateLimit } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { serverCookieHelper } from '@/lib/cookieHelper';

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || 'toredco-admin-secret-key-2024-super-secure';

/* 🔧 Helper: thêm CORS headers vào response */
function addCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

/* OPTIONS handler for CORS preflight */
export async function OPTIONS() {
  return addCors(new NextResponse(null, { status: 200 }));
}

/* POST /api/admin/login */
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [ADMIN LOGIN] API called');
    
    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`admin-login-${clientIP}`, 20, 300000)) {
      console.log('❌ [ADMIN LOGIN] Rate limit exceeded for IP:', clientIP);
      return addCors(
        NextResponse.json(
          { success: false, message: 'Too many login attempts. Please try again later.' },
          { status: 429 },
        )
      );
    }
    
    const { username, password } = await request.json();
    console.log('📝 [ADMIN LOGIN] Received credentials:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ [ADMIN LOGIN] Missing username or password');
      return addCors(
        NextResponse.json(
          { success: false, message: 'Username and password are required' },
          { status: 400 },
        )
      );
    }

    // 1. Xác thực admin
    console.log('🔍 [ADMIN LOGIN] Authenticating user:', username);
    const user = authenticateAdmin(username, password);
    
    if (!user) {
      console.log('❌ [ADMIN LOGIN] Authentication failed for username:', username);
      return addCors(
        NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 },
        )
      );
    }

    console.log('✅ [ADMIN LOGIN] Authentication successful for user:', user.username);

    // 2. Tạo JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    // 3. Trả response + set cookie
    const res = NextResponse.json({
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

    serverCookieHelper.setTokenToResponse(res, token);

    return addCors(res);
  } catch (err) {
    console.error('💥 [ADMIN LOGIN] Error:', err);
    return addCors(
      NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 },
      )
    );
  }
}
