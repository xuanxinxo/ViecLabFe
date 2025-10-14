import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

export const dynamic = "force-dynamic";

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET /api/admin/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const apiUrl = `${backendUrl}/api/jobs/${params.id}`;

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        const res = NextResponse.json(
          { success: false, message: `Không tìm thấy việc làm với ID: ${params.id}` },
          { status: 404 }
        );
        res.headers.set('Access-Control-Allow-Origin', '*');
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res;
      }

      const res = NextResponse.json(
        { success: false, message: `Lỗi từ server: ${apiRes.status}` },
        { status: apiRes.status }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const backendResponse = await apiRes.json();

    const res = NextResponse.json({
      success: true,
      data: backendResponse.success && backendResponse.data ? backendResponse.data : backendResponse
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  } catch (error) {
    console.error('Error fetching job:', error);
    const res = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
}

// PUT /api/admin/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const formData = await request.formData();
    const jobId = params.id;

    // Process form data
    const data: any = {};
    const basicFields = ['title', 'company', 'location', 'type', 'salary', 'description'];

    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value && value.toString().trim() !== '') {
        data[field] = value.toString().trim();
      }
    });

    // Requirements array
    const requirements = formData.getAll('requirements')
      .map(item => item.toString().trim())
      .filter(item => item !== '');
    if (formData.has('requirementsPresent')) {
      data.requirements = requirements;
    }

    // Benefits array
    const benefits = formData.getAll('benefits')
      .map(item => item.toString().trim())
      .filter(item => item !== '');
    if (formData.has('benefitsPresent')) {
      data.benefits = benefits;
    }

    // Deadline
    const deadline = formData.get('deadline');
    if (deadline && deadline.toString().trim() !== '') {
      data.deadline = new Date(deadline.toString()).toISOString();
    }

    if (!data.title || !data.company || !data.location) {
      const res = NextResponse.json(
        { success: false, message: 'Tiêu đề, công ty và địa điểm là bắt buộc' },
        { status: 400 }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const apiRes = await fetch(`${backendUrl}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        const res = NextResponse.json(
          { success: false, message: 'Không tìm thấy việc làm để cập nhật' },
          { status: 404 }
        );
        res.headers.set('Access-Control-Allow-Origin', '*');
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res;
      }

      const res = NextResponse.json(
        { success: false, message: `Lỗi server: ${apiRes.status}` },
        { status: apiRes.status }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const updatedJob = await apiRes.json();

    const res = NextResponse.json({
      success: true,
      message: 'Cập nhật việc làm thành công!',
      data: updatedJob
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  } catch (error) {
    console.error('Error updating job:', error);
    const res = NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi cập nhật việc làm' },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
}

// DELETE /api/admin/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const apiRes = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
      method: 'DELETE',
      headers
    });

    if (!apiRes.ok) {
      const res = NextResponse.json(
        { success: false, message: `Lỗi server: ${apiRes.status}` },
        { status: apiRes.status }
      );
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    const res = NextResponse.json({
      success: true,
      message: 'Xóa việc làm thành công',
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  } catch (error) {
    console.error('Error deleting job:', error);
    const res = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
}
