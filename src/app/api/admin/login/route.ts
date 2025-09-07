// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { serverCookieHelper } from '@/lib/cookieHelper';

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || 'toredco-admin-secret-key-2024-super-secure';

/* POST /api/admin/login */
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [ADMIN LOGIN] API called');
    
    const { username, password } = await request.json();
    console.log('📝 [ADMIN LOGIN] Received credentials:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('❌ [ADMIN LOGIN] Missing username or password');
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 },
      );
    }

    /* 1. Xác thực admin */
    console.log('🔍 [ADMIN LOGIN] Authenticating user:', username);
    const user = authenticateAdmin(username, password);
    
    if (!user) {
      console.log('❌ [ADMIN LOGIN] Authentication failed for username:', username);
      console.log('🔍 [ADMIN LOGIN] Available users:', ['admin', 'admin2', 'admin3']);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
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
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
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
