import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { apiClient } from '../../../../../lib/api';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/users/:id
export async function GET(
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

    // Lấy chi tiết user từ API
    const response = await apiClient.users.getById(id);
    
    const response = NextResponse.json({ 
      success: true, 
      data: response.data 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching user:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
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
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    const { id } = params;
    if (!id) {
      const response = NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // Xóa user từ API
    await apiClient.users.delete(id);
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error deleting user:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

