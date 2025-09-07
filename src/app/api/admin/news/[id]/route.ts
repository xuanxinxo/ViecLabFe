import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { apiClient } from '../../../../../lib/api';

export const dynamic = "force-dynamic";

// PUT /api/admin/news/:id
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
      return NextResponse.json({ success: false, message: 'News ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.summary || !body.link) {
      return NextResponse.json(
        { success: false, message: 'Title, summary, and link are required' },
        { status: 400 }
      );
    }

    // Cập nhật news
    const response = await apiClient.news.update(id, body);
    
    return NextResponse.json({ 
      success: true, 
      data: response.data,
      message: 'News updated successfully' 
    });
  } catch (err) {
    console.error('Error updating news:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/news/:id
export async function DELETE(
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
      return NextResponse.json({ success: false, message: 'News ID is required' }, { status: 400 });
    }

    // Xóa news
    await apiClient.news.delete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'News deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting news:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

