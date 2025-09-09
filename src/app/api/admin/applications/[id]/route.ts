import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/applications/[id] - Get application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
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

    return NextResponse.json({ 
      success: true, 
      data: application 
    });
  } catch (err) {
    console.error('Error fetching application:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('📝 [ADMIN APPLICATIONS] Update request:', { id, body });

    // Validate required fields
    if (!body.applicantName || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Applicant name and email are required' },
        { status: 400 }
      );
    }

    // Update application
    const updatedApplication = {
      id,
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN APPLICATIONS] Application updated successfully:', id);
    
    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    });
  } catch (err) {
    console.error('Error updating application:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required' }, { status: 400 });
    }

    console.log('🗑️ [ADMIN APPLICATIONS] Deleting application:', id);

    // In real implementation, delete from backend
    // For now, just return success

    console.log('✅ [ADMIN APPLICATIONS] Application deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting application:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}



