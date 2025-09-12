import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/news/[id] - Get news details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    return addCorsHeaders(response);
    }

    const { id } = params;
    if (!id) {
      const response = NextResponse.json({ success: false, message: 'News ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // For now, return a mock news item
    // In real implementation, fetch from backend
    const news = {
      id,
      title: 'Sample News Title',
      summary: 'Sample news summary...',
      content: 'Sample news content...',
      link: '/news/sample-news',
      imageUrl: '/images/sample-news.jpg',
      date: '2024-01-15',
      author: 'TOREDCO Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = NextResponse.json({ 
      success: true, 
      data: news 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching news:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT /api/admin/news/[id] - Update news
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    return addCorsHeaders(response);
    }

    const { id } = params;
    if (!id) {
      const response = NextResponse.json({ success: false, message: 'News ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    console.log('📝 [ADMIN NEWS] Update request:', { id, body });

    // Validate required fields
    if (!body.title || !body.summary) {
      const response = NextResponse.json(
        { success: false, message: 'Title and summary are required' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Update news
    const updatedNews = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN NEWS] News updated successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      data: updatedNews,
      message: 'News updated successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating news:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE /api/admin/news/[id] - Delete news
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    return addCorsHeaders(response);
    }

    const { id } = params;
    if (!id) {
      const response = NextResponse.json({ success: false, message: 'News ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    console.log('🗑️ [ADMIN NEWS] Deleting news:', id);

    // In real implementation, delete from backend
    // For now, just return success

    console.log('✅ [ADMIN NEWS] News deleted successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      message: 'News deleted successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error deleting news:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}