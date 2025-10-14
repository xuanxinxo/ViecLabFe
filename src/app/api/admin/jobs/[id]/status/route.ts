import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// ✅ Helper thêm CORS headers
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// ✅ OPTIONS handler cho CORS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

// ✅ PUT /api/admin/jobs/:id/status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return withCORS(
        NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      );
    }

    const { id } = params;
    if (!id) {
      return withCORS(
        NextResponse.json({ success: false, message: 'Job ID is required' }, { status: 400 })
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return withCORS(
        NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 })
      );
    }

    // ✅ Validate status
    const validStatuses = ['pending', 'active', 'expired', 'deleted'];
    if (!validStatuses.includes(status)) {
      return withCORS(
        NextResponse.json(
          { success: false, message: 'Invalid status. Must be one of: pending, active, expired, deleted' },
          { status: 400 }
        )
      );
    }

    // ✅ Call backend API để update job status
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const updatedJob = await response.json();
    console.log('✅ [ADMIN JOBS STATUS] Job status updated:', { id, status });

    return withCORS(
      NextResponse.json({
        success: true,
        data: updatedJob,
        message: 'Job status updated successfully',
      })
    );
  } catch (err: any) {
    console.error('💥 Error updating job status:', err);
    return withCORS(
      NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    );
  }
}
