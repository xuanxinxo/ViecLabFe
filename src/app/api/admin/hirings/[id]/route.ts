import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';

export const dynamic = "force-dynamic";

// PUT /api/admin/hirings/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.company || !body.location) {
      return NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    }

    // Mock update hiring (trong thực tế sẽ cập nhật database)
    const updatedHiring = {
      id: id,
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type || 'Full-time',
      salary: body.salary || 'Thỏa thuận',
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      img: body.img || '',
      description: body.description || 'Mô tả công việc sẽ được cập nhật sau.',
      requirements: body.requirements || ['Kinh nghiệm làm việc', 'Kỹ năng chuyên môn'],
      benefits: body.benefits || ['Lương thưởng hấp dẫn', 'Môi trường làm việc tốt'],
      contactInfo: {
        email: body.contactEmail || 'hr@company.com',
        phone: body.contactPhone || '0900000000',
        contactPerson: body.contactPerson || 'HR Department'
      },
      postedDate: new Date().toISOString().split('T')[0],
      status: body.status || 'active',
      applicationsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true, 
      data: updatedHiring,
      message: 'Hiring updated successfully' 
    });
  } catch (err) {
    console.error('Error updating hiring:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hirings/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    }

    // Mock delete hiring (trong thực tế sẽ xóa từ database)
    console.log(`Mock deleting hiring with ID: ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hiring deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting hiring:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

