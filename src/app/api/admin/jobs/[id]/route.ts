import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import fs from 'fs/promises';
import path from 'path';

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

    // Call backend API directly
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const backendResponse = await response.json();
    
    // Backend returns {success: true, data: {...}}
    if (backendResponse.success && backendResponse.data) {
      return NextResponse.json({ success: true, data: backendResponse.data });
    } else {
      // Fallback if backend response format is different
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

    console.log('📝 [ADMIN JOBS] Processing form data for job:', jobId);
    
    try {
      const formDataEntries = Array.from(formData.entries());
      console.log('📝 [ADMIN JOBS] FormData entries:', formDataEntries);
      console.log('📝 [ADMIN JOBS] FormData entries count:', formDataEntries.length);
    } catch (formDataError) {
      console.error('💥 [ADMIN JOBS] Error reading FormData entries:', formDataError);
      return NextResponse.json(
        { success: false, message: 'Lỗi đọc dữ liệu form' },
        { status: 400 }
      );
    }

    // Process form data
    const data: any = {};
    
    try {
      // Handle basic fields
      const basicFields = ['title', 'company', 'location', 'type', 'salary', 'description', 'status'];
      basicFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          data[field] = value.toString().trim();
        }
      });
      
      // Handle requirements array
      try {
        const requirements = formData.getAll('requirements').map(item => item.toString().trim()).filter(item => item !== '');
        if (requirements.length > 0) {
          data.requirements = requirements;
          console.log('📝 [ADMIN JOBS] Requirements processed:', requirements);
        }
      } catch (reqError) {
        console.warn('⚠️ [ADMIN JOBS] Error processing requirements:', reqError);
      }
      
      // Handle benefits array
      try {
        const benefits = formData.getAll('benefits').map(item => item.toString().trim()).filter(item => item !== '');
        if (benefits.length > 0) {
          data.benefits = benefits;
          console.log('📝 [ADMIN JOBS] Benefits processed:', benefits);
        }
      } catch (benError) {
        console.warn('⚠️ [ADMIN JOBS] Error processing benefits:', benError);
      }
      
      // Handle deadline
      const deadline = formData.get('deadline');
      if (deadline && deadline.toString().trim() !== '') {
        try {
          data.deadline = new Date(deadline.toString()).toISOString();
        } catch (error) {
          console.warn('⚠️ [ADMIN JOBS] Invalid deadline format:', deadline);
        }
      }
      
      console.log('📝 [ADMIN JOBS] Processed data:', data);
      
      // Validate required fields
      if (!data.title || !data.company || !data.location) {
        console.log('❌ [ADMIN JOBS] Missing required fields:', {
          title: !!data.title,
          company: !!data.company,
          location: !!data.location
        });
        return NextResponse.json(
          { success: false, message: 'Tiêu đề, công ty và địa điểm là bắt buộc' },
          { status: 400 }
        );
      }
      
      console.log('✅ [ADMIN JOBS] Data validation passed');
      
    } catch (error) {
      console.error('💥 [ADMIN JOBS] Error processing form data:', error);
      return NextResponse.json(
        { success: false, message: 'Lỗi xử lý dữ liệu form' },
        { status: 400 }
      );
    }

    // Handle file upload if present
    const imgFile = formData.get('img') as File | null;
    if (imgFile && imgFile instanceof File && imgFile.size > 0) {
      try {
        console.log('📁 [ADMIN JOBS] Processing image upload:', {
          name: imgFile.name,
          size: imgFile.size,
          type: imgFile.type
        });
        
        const buffer = Buffer.from(await imgFile.arrayBuffer());
        const filename = `${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'jobs');
        
        console.log('📁 [ADMIN JOBS] Upload directory:', uploadDir);
        
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        data.img = `/uploads/jobs/${filename}`;
        console.log('✅ [ADMIN JOBS] Image uploaded successfully:', filename);
      } catch (fileError) {
        console.error('❌ [ADMIN JOBS] File upload error:', fileError);
        console.log('⚠️ [ADMIN JOBS] Continuing without image upload');
        // Continue without image if upload fails
      }
    } else {
      console.log('📁 [ADMIN JOBS] No image file to upload');
    }

    // Call backend API to update the job
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    console.log('📤 [ADMIN JOBS] Sending update request to backend:', {
      url: `${backendUrl}/api/jobs/${jobId}`,
      data: data,
      backendUrl: backendUrl
    });
    
    // Forward the authorization header to backend
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔐 [ADMIN JOBS] Forwarding auth header to backend');
    } else {
      console.log('⚠️ [ADMIN JOBS] No auth header found');
    }
    
    console.log('📤 [ADMIN JOBS] Request headers:', headers);
    console.log('📤 [ADMIN JOBS] Request body size:', JSON.stringify(data).length);
    
    // Final validation before sending to backend
    if (Object.keys(data).length === 0) {
      console.error('❌ [ADMIN JOBS] No data to send to backend');
      return NextResponse.json(
        { success: false, message: 'Không có dữ liệu để cập nhật' },
        { status: 400 }
      );
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      
      console.log('📥 [ADMIN JOBS] Backend response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ADMIN JOBS] Backend API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, message: 'Không tìm thấy việc làm để cập nhật' },
            { status: 404 }
          );
        }
        
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }
      
      const updatedJob = await response.json();
      console.log('✅ [ADMIN JOBS] Job updated successfully:', updatedJob);

      return NextResponse.json({
        success: true,
        message: 'Cập nhật việc làm thành công!',
        data: updatedJob
      });
    } catch (fetchError) {
      console.error('💥 [ADMIN JOBS] Fetch error:', fetchError);
      throw new Error(`Backend connection failed: ${fetchError}`);
    }
  } catch (error) {
    console.error('❌ [ADMIN JOBS] Error updating job:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Có lỗi xảy ra khi cập nhật việc làm';
    
    if (error instanceof Error) {
      if (error.message.includes('Backend API error')) {
        errorMessage = 'Lỗi kết nối với backend server';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Lỗi tạo thư mục upload';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
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

    // Call backend API to delete the job
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    
    // Forward the authorization header to backend
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔐 [ADMIN JOBS] Forwarding auth header to backend (DELETE)');
    } else {
      console.log('⚠️ [ADMIN JOBS] No auth header found (DELETE)');
    }
    
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    console.log('✅ [ADMIN JOBS] Job deleted successfully:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/jobs/[id] - Quick update job fields
export async function PATCH(
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

    const body = await request.json();
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'img'
    ];

    // Filter only allowed fields
    const updateData: any = {};
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key) && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // Call backend API to update the job
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    
    // Forward the authorization header to backend
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔐 [ADMIN JOBS] Forwarding auth header to backend (PATCH)');
    } else {
      console.log('⚠️ [ADMIN JOBS] No auth header found (PATCH)');
    }
    
    const response = await fetch(`${backendUrl}/api/jobs/${params.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const updatedJob = await response.json();
    console.log('✅ [ADMIN JOBS] Job updated successfully via PATCH:', updatedJob);

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}