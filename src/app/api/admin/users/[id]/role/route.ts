import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../../lib/auth';
import { apiClient } from '../../../../../../lib/api';

export const dynamic = "force-dynamic";

// Helper để thêm CORS headers
function setCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 200 }));
}

// PUT /api/admin/users/:id/role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return setCors(
        NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      );
    }

    const { id } = params;
    if (!id) {
      return setCors(
        NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return setCors(
        NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 })
      );
    }

    // Validate role
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return setCors(
        NextResponse.json(
          { success: false, message: 'Invalid role. Must be one of: user, admin, moderator' },
          { status: 400 }
        )
      );
    }

    // Gọi backend update role
    const apiRes = await apiClient.users.update(id, { role });

    return setCors(
      NextResponse.json({
        success: true,
        data: apiRes.data,
        message: 'User role updated successfully'
      })
    );

  } catch (err) {
    console.error('💥 [ADMIN USERS] Error updating user role:', err);
    return setCors(
      NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}
