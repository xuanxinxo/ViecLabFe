import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/hirings/[id] - Get hiring details
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
      const response = NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // For now, return a mock hiring
    // In real implementation, fetch from backend
    const hiring = {
      id,
      title: 'Sample Hiring Position',
      company: 'Sample Company',
      location: 'Sample Location',
      type: 'Full-time',
      salary: 'Sample Salary',
      urgencyLevel: 'medium',
      description: 'Sample job description...',
      requirements: ['Sample requirement 1', 'Sample requirement 2'],
      benefits: ['Sample benefit 1', 'Sample benefit 2'],
      contactInfo: {
        email: 'hr@sample.com',
        phone: '0123456789',
        contactPerson: 'Sample Person'
      },
      deadline: '2024-12-31',
      postedDate: '2024-01-01',
      status: 'active',
      applicationsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = NextResponse.json({ 
      success: true, 
      data: hiring 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching hiring:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT /api/admin/hirings/[id] - Update hiring
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
      const response = NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    console.log('📝 [ADMIN HIRINGS] Update request:', { id, body });

    // Validate required fields
    if (!body.title || !body.company || !body.location) {
      const response = NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Update hiring
    const updatedHiring = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN HIRINGS] Hiring updated successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      data: updatedHiring,
      message: 'Hiring updated successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating hiring:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE /api/admin/hirings/[id] - Delete hiring
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
      const response = NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    console.log('🗑️ [ADMIN HIRINGS] Deleting hiring:', id);

    // In real implementation, delete from backend
    // For now, just return success

    console.log('✅ [ADMIN HIRINGS] Hiring deleted successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      message: 'Hiring deleted successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error deleting hiring:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}