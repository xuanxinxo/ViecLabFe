import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
export const dynamic = "force-dynamic";

// PUT /api/admin/newjobs/[id] - Cập nhật việc làm
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const jobId = params.id;
    let body;
    let imageData = null;

    // Kiểm tra content-type để xử lý FormData hoặc JSON
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Xử lý FormData (có upload file)
      const formData = await request.formData();
      
      // Lấy file image
      const imageFile = formData.get('image') as File;
      if (imageFile) {
        // Convert file to base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageData = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      }
      
      // Lấy các trường dữ liệu khác
      body = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        salary: formData.get('salary'),
        tags: formData.get('tags'),
        isRemote: formData.get('isRemote') === 'true',
        type: formData.get('type'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        benefits: formData.get('benefits'),
        deadline: formData.get('deadline'),
        status: formData.get('status'),
      };
    } else {
      // Xử lý JSON data
      body = await request.json();
      imageData = body.image || body.img;
    }
    
    // Chỉ update các trường hợp lệ
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'isRemote', 'tags', 'img'
    ];
    
    const data: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'requirements' || key === 'benefits' || key === 'tags') {
          // Xử lý các trường array
          if (typeof body[key] === 'string') {
            try {
              data[key] = JSON.parse(body[key]);
            } catch {
              // Nếu không parse được JSON, xử lý như string
              if (key === 'tags') {
                data[key] = body[key].split(',').map((t: string) => t.trim()).filter(Boolean);
              } else {
                data[key] = body[key].split('\n').filter(Boolean);
              }
            }
          } else {
            data[key] = body[key];
          }
        } else {
          data[key] = body[key];
        }
      }
    }

    // Thêm hình ảnh nếu có
    if (imageData) {
      data.img = imageData;
    }
    
    await prisma.newJob.update({
      where: { id: jobId },
      data,
    });
    
    return NextResponse.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/newjobs/[id] - Xóa việc làm (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const jobId = params.id;
    await prisma.newJob.update({
      where: { id: jobId },
      data: { status: 'deleted' },
    });
    
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 

// PATCH /api/admin/newjobs/[id] - Cập nhật nhanh trạng thái hoặc trường lẻ
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const jobId = params.id;
    const body = await request.json();
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'isRemote', 'tags'
    ];
    const data: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    await prisma.newJob.update({
      where: { id: jobId },
      data,
    });
    return NextResponse.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 