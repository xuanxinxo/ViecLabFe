import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../../lib/auth';
import { apiClient } from '../../../../../../lib/api';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// PUT /api/admin/users/:id/role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    const { id } = params;
    if (!id) {
      const response = NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      const response = NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // Validate role
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      const response = NextResponse.json({ 
        success: false, 
        message: 'Invalid role. Must be one of: user, admin, moderator' 
      }, { status: 400 });
    return addCorsHeaders(response);
    }

    // Cập nhật role của user
    const response = await apiClient.users.update(id, { role });
    
    const response = NextResponse.json({ 
      success: true, 
      data: response.data,
      message: 'User role updated successfully' 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating user role:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

