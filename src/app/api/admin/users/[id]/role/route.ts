import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../../lib/auth';
import { apiClient } from '../../../../../../lib/api';

export const dynamic = "force-dynamic";

// PUT /api/admin/users/:id/role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role. Must be one of: user, admin, moderator' 
      }, { status: 400 });
    }

    // Cập nhật role của user
    const response = await apiClient.users.update(id, { role });
    
    return NextResponse.json({ 
      success: true, 
      data: response.data,
      message: 'User role updated successfully' 
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

