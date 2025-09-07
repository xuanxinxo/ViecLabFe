import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/hirings
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN HIRINGS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN HIRINGS] Admin verified:', admin.username);

    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const status = request.nextUrl.searchParams.get('status') || '';
    const search = request.nextUrl.searchParams.get('search') || '';

    console.log('🔍 [ADMIN HIRINGS] Query params:', { page, limit, status, search });

    // Sample hirings data
    const sampleHirings = [
      {
        id: 'hiring-1',
        title: 'Urgent: Senior React Developer',
        company: 'TechViet Solutions',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        salary: '30.000.000 - 45.000.000 VND',
        urgencyLevel: 'high',
        description: 'Cần tuyển gấp Senior React Developer cho dự án banking.',
        requirements: [
          'Kinh nghiệm 5+ năm với React',
          'Thành thạo TypeScript, Redux',
          'Hiểu biết về microservices'
        ],
        benefits: [
          'Lương thưởng hấp dẫn',
          'Cơ hội thăng tiến',
          'Bảo hiểm toàn diện'
        ],
        contactInfo: {
          email: 'hr@techviet.com',
          phone: '0901234567',
          contactPerson: 'Ms. Lan'
        },
        deadline: '2024-02-15',
        postedDate: '2024-01-10',
        status: 'active',
        applicationsCount: 15,
        viewsCount: 245,
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        id: 'hiring-2',
        title: 'DevOps Engineer - Remote',
        company: 'CloudFirst Vietnam',
        location: 'Remote',
        type: 'Full-time',
        salary: '25.000.000 - 35.000.000 VND',
        urgencyLevel: 'medium',
        description: 'Tìm DevOps Engineer cho team infrastructure.',
        requirements: [
          'Kinh nghiệm AWS/Azure',
          'Docker, Kubernetes',
          'CI/CD pipelines'
        ],
        benefits: [
          'Remote 100%',
          'Flexible working hours',
          'Learning budget'
        ],
        contactInfo: {
          email: 'talent@cloudfirst.vn',
          phone: '0912345678',
          contactPerson: 'Mr. Dũng'
        },
        deadline: '2024-02-20',
        postedDate: '2024-01-08',
        status: 'active',
        applicationsCount: 8,
        viewsCount: 156,
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-08').toISOString()
      },
      {
        id: 'hiring-3',
        title: 'Product Designer',
        company: 'StartupXYZ',
        location: 'Hà Nội',
        type: 'Contract',
        salary: '20.000.000 - 28.000.000 VND',
        urgencyLevel: 'low',
        description: 'Thiết kế sản phẩm cho ứng dụng fintech mới.',
        requirements: [
          'Portfolio sản phẩm digital',
          'Figma, Sketch advanced',
          'User research experience'
        ],
        benefits: [
          'Stock options',
          'Creative environment',
          'International team'
        ],
        contactInfo: {
          email: 'design@startupxyz.co',
          phone: '0923456789',
          contactPerson: 'Ms. Hương'
        },
        deadline: '2024-03-01',
        postedDate: '2024-01-05',
        status: 'closed',
        applicationsCount: 12,
        viewsCount: 89,
        createdAt: new Date('2024-01-05').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      }
    ];

    // Filter by status and search
    let filteredHirings = sampleHirings;
    
    if (status && status !== 'all') {
      filteredHirings = filteredHirings.filter(hiring => hiring.status === status);
    }
    
    if (search) {
      filteredHirings = filteredHirings.filter(hiring => 
        hiring.title.toLowerCase().includes(search.toLowerCase()) ||
        hiring.company.toLowerCase().includes(search.toLowerCase()) ||
        hiring.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedHirings = filteredHirings.slice(startIndex, startIndex + limitNum);

    console.log('✅ [ADMIN HIRINGS] Returning hirings:', paginatedHirings.length);
    
    return NextResponse.json({ 
      success: true, 
      data: paginatedHirings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredHirings.length,
        totalPages: Math.ceil(filteredHirings.length / limitNum)
      }
    });
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hirings
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] POST request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN HIRINGS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN HIRINGS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN HIRINGS] Request body:', body);
    
    // Validate required fields
    if (!body.title || !body.company || !body.location) {
      console.log('❌ [ADMIN HIRINGS] Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    }

    // Tạo hiring mới với sample data
    const newHiring = {
      id: `hiring-${Date.now()}`,
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type || 'Full-time',
      salary: body.salary || 'Thỏa thuận',
      urgencyLevel: body.urgencyLevel || 'medium',
      description: body.description || 'Mô tả công việc sẽ được cập nhật sau.',
      requirements: body.requirements || ['Kinh nghiệm làm việc', 'Kỹ năng chuyên môn'],
      benefits: body.benefits || ['Lương thưởng hấp dẫn', 'Môi trường làm việc tốt'],
      contactInfo: {
        email: body.contactEmail || 'hr@company.com',
        phone: body.contactPhone || '0900000000',
        contactPerson: body.contactPerson || 'HR Department'
      },
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      postedDate: new Date().toISOString().split('T')[0],
      status: body.status || 'active',
      applicationsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN HIRINGS] Hiring created successfully:', newHiring.id);
    
    return NextResponse.json(
      { success: true, data: newHiring, message: 'Hiring created successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

