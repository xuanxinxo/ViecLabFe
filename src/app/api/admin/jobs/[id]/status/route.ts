import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// PUT /api/admin/jobs/:id/status
export async function PUT(
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
      const response = NextResponse.json({ success: false, message: 'Job ID is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      const response = NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    return addCorsHeaders(response);
    }

    // Validate status
    const validStatuses = ['pending', 'active', 'expired', 'deleted'];
    if (!validStatuses.includes(status)) {
      const response = NextResponse.json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, active, expired, deleted' 
      }, { status: 400 });
    return addCorsHeaders(response);
    }

    // Call backend API to update job status
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/jobs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const updatedJob = await response.json();
    console.log('✅ [ADMIN JOBS STATUS] Job status updated successfully:', { id, status, data: updatedJob });
    
    const response = NextResponse.json({ 
      success: true, 
      data: updatedJob,
      message: 'Job status updated successfully' 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating job status:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

