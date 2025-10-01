import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api';
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

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN USERS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN USERS] Unauthorized access');
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    console.log('✅ [ADMIN USERS] Admin verified:', admin.username);

    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const search = request.nextUrl.searchParams.get('search') || '';
    const role = request.nextUrl.searchParams.get('role') || '';

    console.log('🔍 [ADMIN USERS] Query params:', { page, limit, search, role });

    // For now, return sample users data
    // In real implementation, fetch from backend
    const sampleUsers = [
      {
        id: 'user-1',
        username: 'john_doe',
        email: 'john.doe@email.com',
        fullName: 'John Doe',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-01-01').toISOString(),
        lastLogin: new Date('2024-01-15').toISOString(),
        profile: {
          avatar: '/avatars/john.jpg',
          bio: 'Frontend Developer with 3 years experience',
          skills: ['React', 'JavaScript', 'CSS']
        }
      },
      {
        id: 'user-2',
        username: 'jane_smith',
        email: 'jane.smith@email.com',
        fullName: 'Jane Smith',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-01-02').toISOString(),
        lastLogin: new Date('2024-01-14').toISOString(),
        profile: {
          avatar: '/avatars/jane.jpg',
          bio: 'Backend Developer specializing in Node.js',
          skills: ['Node.js', 'MongoDB', 'Express']
        }
      },
      {
        id: 'user-3',
        username: 'mike_wilson',
        email: 'mike.wilson@email.com',
        fullName: 'Mike Wilson',
        role: 'user',
        status: 'inactive',
        createdAt: new Date('2024-01-03').toISOString(),
        lastLogin: new Date('2024-01-10').toISOString(),
        profile: {
          avatar: '/avatars/mike.jpg',
          bio: 'Full-stack Developer',
          skills: ['React', 'Node.js', 'PostgreSQL']
        }
      }
    ];

    // Filter by search and role
    let filteredUsers = sampleUsers;
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limitNum);

    console.log('✅ [ADMIN USERS] Returning users:', paginatedUsers.length);
    
    const response = NextResponse.json({ 
      success: true, 
      data: paginatedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limitNum);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
      }
    });
  } catch (err) {
    console.error('💥 [ADMIN USERS] Error:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}

