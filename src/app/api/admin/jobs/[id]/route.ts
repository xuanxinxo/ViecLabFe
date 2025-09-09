import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const apiUrl = `${backendUrl}/api/jobs/${params.id}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: `Không tìm thấy việc làm với ID: ${params.id}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: `Lỗi từ server: ${response.status}` },
        { status: response.status }
      );
    }

    const backendResponse = await response.json();
    
    if (backendResponse.success && backendResponse.data) {
      return NextResponse.json({ success: true, data: backendResponse.data });
    } else {
      return NextResponse.json({ success: true, data: backendResponse });
    }
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const jobId = params.id;

    // Process form data
    const data: any = {};
    
    // Basic fields
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
    
    // Validate required fields
    if (!data.title || !data.company || !data.location) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề, công ty và địa điểm là bắt buộc' },
        { status: 400 }
      );
    }

    // Handle image upload
    const imgFile = formData.get('img') as File | null;
    if (imgFile && imgFile instanceof File && imgFile.size > 0) {
      // For now, just keep the existing image or skip upload
      // You can implement file upload logic here if needed
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${backendUrl}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy việc làm để cập nhật' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: `Lỗi server: ${response.status}` },
        { status: response.status }
      );
    }
    
    const updatedJob = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Cập nhật việc làm thành công!',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi cập nhật việc làm' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Lỗi server: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa việc làm thành công',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}