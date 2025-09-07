import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api';

export const dynamic = "force-dynamic";

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const search = request.nextUrl.searchParams.get('search') || '';
    const role = request.nextUrl.searchParams.get('role') || '';

    // Lấy danh sách users từ API
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);

    const response = await apiClient.users.getAll(`?${queryParams.toString()}`);
    
    return NextResponse.json({ 
      success: true, 
      data: response.data 
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

