import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/profile
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Trả về thông tin admin (không bao gồm password)
    const adminProfile = {
      userId: admin.userId,
      username: admin.username,
      role: admin.role,
      email: `${admin.username}@toredco.com`, // Mock email
      name: `Admin ${admin.username}`,
      avatar: null,
      lastLogin: new Date().toISOString(),
      permissions: admin.permissions || ['read', 'write', 'delete', 'approve']
    };

    return NextResponse.json({ 
      success: true, 
      data: adminProfile 
    });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

