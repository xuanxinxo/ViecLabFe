import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { apiClient } from '../../../../../lib/api';

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

// GET /api/admin/users/:id
export async function GET(
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

    // Lấy chi tiết user từ API
    const apiRes = await apiClient.users.getById(id);

    return setCors(
      NextResponse.json({ success: true, data: apiRes.data })
    );

  } catch (err) {
    console.error('💥 [ADMIN USERS] Error fetching user:', err);
    return setCors(
      NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    );
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(
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

    // Xóa user từ API
    await apiClient.users.delete(id);

    return setCors(
      NextResponse.json({ success: true, message: 'User deleted successfully' })
    );

  } catch (err) {
    console.error('💥 [ADMIN USERS] Error deleting user:', err);
    return setCors(
      NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    );
  }
}
