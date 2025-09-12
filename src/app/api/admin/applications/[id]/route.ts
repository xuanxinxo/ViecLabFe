import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/applications/[id] - Get application details
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
      const response = NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // For now, return a mock application
    // In real implementation, fetch from backend
    const application = {
      id,
      applicantName: 'Sample Applicant',
      email: 'sample@email.com',
      phone: '0123456789',
      jobTitle: 'Sample Job',
      jobId: 'job-1',
      company: 'Sample Company',
      appliedDate: '2024-01-10',
      status: 'pending',
      resume: '/resumes/sample.pdf',
      coverLetter: 'Sample cover letter...',
      experience: '2 years',
      skills: ['React', 'JavaScript'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = NextResponse.json({ 
      success: true, 
      data: application 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching application:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT /api/admin/applications/[id] - Update application
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
      const response = NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    console.log('📝 [ADMIN APPLICATIONS] Update request:', { id, body });

    // Validate required fields
    if (!body.applicantName || !body.email) {
      const response = NextResponse.json(
        { success: false, message: 'Applicant name and email are required' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Update application
    const updatedApplication = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN APPLICATIONS] Application updated successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating application:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE /api/admin/applications/[id] - Delete application
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
      const response = NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    console.log('🗑️ [ADMIN APPLICATIONS] Deleting application:', id);

    // In real implementation, delete from backend
    // For now, just return success

    console.log('✅ [ADMIN APPLICATIONS] Application deleted successfully:', id);
    
    const response = NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error deleting application:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}



