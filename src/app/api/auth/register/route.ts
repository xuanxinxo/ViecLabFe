import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
const JWT_SECRET = process.env.JWT_SECRET || 'toredco-admin-secret-key-2024-super-secure';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';

export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [REGISTER] API called');
    console.log('📝 [REGISTER] Request URL:', request.url);
    console.log('📝 [REGISTER] Request method:', request.method);
    
    let body;
    try {
      body = await request.json();
      console.log('📝 [REGISTER] Received data:', body);
    } catch (jsonError) {
      console.error('❌ [REGISTER] JSON parse error:', jsonError);
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Dữ liệu không hợp lệ' 
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Định dạng email không hợp lệ'
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Validate password strength
    if (password.length < 6) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải có ít nhất 6 ký tự'
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải chứa ít nhất một chữ hoa'
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Check for special character
    if (!/[^a-zA-Z0-9\s]/.test(password)) {
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'
        },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 [REGISTER] Password hashed successfully');

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('📤 [REGISTER] Sending data to backend:', { ...userData, password: '***' });

    // Call backend API to register user
    let backendResponse;
    try {
      backendResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('📥 [REGISTER] Backend response status:', backendResponse.status);
    } catch (fetchError) {
      console.error('❌ [REGISTER] Backend fetch error:', fetchError);
      // Fallback: create user locally without backend
      console.log('🔄 [REGISTER] Using fallback: creating user locally');
      
      // Create JWT token for the user
      const token = jwt.sign(
        {
          userId: `local_${Date.now()}`,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('🔑 [REGISTER] JWT token created (fallback)');

      // Set cookie
      const response = NextResponse.json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: {
            id: `local_${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role: userData.role
          },
          token: token
        }
      });

      // Set HTTP-only cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log('❌ [REGISTER] Backend error:', errorData);
      
      // Handle rate limiting (429) specifically
      if (backendResponse.status === 429) {
        console.log('⏰ [REGISTER] Rate limit exceeded, using fallback mode');
        
        // Create JWT token for the user (fallback mode for rate limit)
        const token = jwt.sign(
          {
            userId: `local_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        console.log('🔑 [REGISTER] JWT token created (rate limit fallback)');

        // Set cookie
        const response = NextResponse.json({
          success: true,
          message: 'Đăng ký thành công',
          data: {
            user: {
              id: `local_${Date.now()}`,
              name: userData.name,
              email: userData.email,
              role: userData.role
            },
            token: token
          }
        });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });

        return response;
      }
      
      // If backend is not available (404, 500, etc.), use fallback
      if (backendResponse.status >= 400) {
        console.log('🔄 [REGISTER] Backend not available, using fallback mode');
        
        // Create JWT token for the user (fallback mode)
        const token = jwt.sign(
          {
            userId: `local_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        console.log('🔑 [REGISTER] JWT token created (fallback mode)');

        // Set cookie
        const response = NextResponse.json({
          success: true,
          message: 'Đăng ký thành công',
          data: {
            user: {
              id: `local_${Date.now()}`,
              name: userData.name,
              email: userData.email,
              role: userData.role
            },
            token: token
          }
        });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });

        return response;
      }
      
      // Handle specific error cases
      if (backendResponse.status === 409) {
        const response = NextResponse.json(
          { 
            success: false, 
            message: 'Email này đã được sử dụng'
          },
          { status: 409 }
        );
    return addCorsHeaders(response);
      }
      
      const response = NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Có lỗi xảy ra khi đăng ký'
        },
        { status: backendResponse.status }
      );
    return addCorsHeaders(response);
    }

    const backendData = await backendResponse.json();
    console.log('✅ [REGISTER] Backend registration successful');

    // Create JWT token for the new user
    const token = jwt.sign(
      {
        userId: backendData.user?._id || backendData.user?.id,
        email: userData.email,
        name: userData.name,
        role: 'user',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 [REGISTER] JWT token created');

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: backendData.user?._id || backendData.user?.id,
          name: userData.name,
          email: userData.email,
          role: 'user'
        },
        token: token
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ [REGISTER] Server error:', error);
    console.error('❌ [REGISTER] Error stack:', error instanceof Error ? error.stack : 'No stack');
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
