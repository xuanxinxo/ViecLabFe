import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/newjobs/[id] - Get newjob details
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
      const response = NextResponse.json({ success: false, message: 'NewJob ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // For now, return a mock newjob
    // In real implementation, fetch from backend
    const newjob = {
      id,
      title: 'Sample NewJob Position',
      company: 'Sample Company',
      location: 'Sample Location',
      type: 'Full-time',
      salary: 'Sample Salary',
      description: 'Sample job description...',
      requirements: ['Sample requirement 1', 'Sample requirement 2'],
      benefits: ['Sample benefit 1', 'Sample benefit 2'],
      tags: ['Sample tag 1', 'Sample tag 2'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isRemote: false,
      img: '/img/sample.jpg'
    };

    const response = NextResponse.json({ 
      success: true, 
      data: newjob 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching newjob:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT /api/admin/newjobs/[id] - Update newjob
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
      const response = NextResponse.json({ success: false, message: 'NewJob ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    console.log('📝 [ADMIN NEWJOBS] Update request:', { id, body });

    // Validate required fields
    if (!body.title || !body.company || !body.location) {
      const response = NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Update newjob
    const updatedNewjob = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN NEWJOBS] NewJob updated successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      data: updatedNewjob,
      message: 'NewJob updated successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating newjob:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE /api/admin/newjobs/[id] - Delete newjob
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
      const response = NextResponse.json({ success: false, message: 'NewJob ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    console.log('🗑️ [ADMIN NEWJOBS] Deleting newjob:', id);

    // In real implementation, delete from backend
    // For now, just return success

    console.log('✅ [ADMIN NEWJOBS] NewJob deleted successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      message: 'NewJob deleted successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error deleting newjob:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}



