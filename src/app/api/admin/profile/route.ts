import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/profile
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
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

    const response = NextResponse.json({ 
      success: true, 
      data: adminProfile 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

