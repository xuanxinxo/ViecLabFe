import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/applications
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN APPLICATIONS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN APPLICATIONS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN APPLICATIONS] Admin verified:', admin.username);

    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const status = request.nextUrl.searchParams.get('status') || '';
    const search = request.nextUrl.searchParams.get('search') || '';

    console.log('🔍 [ADMIN APPLICATIONS] Query params:', { page, limit, status, search });

    // Sample applications data
    const sampleApplications = [
      {
        id: 'app-1',
        applicantName: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        jobTitle: 'Frontend Developer React',
        jobId: 'job-1',
        company: 'TechCorp Vietnam',
        appliedDate: '2024-01-10',
        status: 'pending',
        resume: '/resumes/nguyenvana-cv.pdf',
        coverLetter: 'Tôi rất quan tâm đến vị trí Frontend Developer tại công ty...',
        experience: '3 năm',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        id: 'app-2',
        applicantName: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        jobTitle: 'Backend Developer Node.js',
        jobId: 'job-2',
        company: 'StartupHub',
        appliedDate: '2024-01-08',
        status: 'approved',
        resume: '/resumes/tranthib-cv.pdf',
        coverLetter: 'Với kinh nghiệm 4 năm làm việc với Node.js...',
        experience: '4 năm',
        skills: ['Node.js', 'MongoDB', 'Express', 'TypeScript'],
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString()
      },
      {
        id: 'app-3',
        applicantName: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0369852147',
        jobTitle: 'UI/UX Designer',
        jobId: 'job-3',
        company: 'Creative Studio',
        appliedDate: '2024-01-05',
        status: 'rejected',
        resume: '/resumes/levanc-portfolio.pdf',
        coverLetter: 'Tôi là một UI/UX Designer với đam mê tạo ra những sản phẩm...',
        experience: '2 năm',
        skills: ['Figma', 'Sketch', 'Adobe XD', 'UI Design'],
        createdAt: new Date('2024-01-05').toISOString(),
        updatedAt: new Date('2024-01-14').toISOString()
      },
      {
        id: 'app-4',
        applicantName: 'Phạm Thị D',
        email: 'phamthid@email.com',
        phone: '0741852963',
        jobTitle: 'Mobile Developer Flutter',
        jobId: 'job-4',
        company: 'AppStudio',
        appliedDate: '2024-01-12',
        status: 'pending',
        resume: '/resumes/phamthid-cv.pdf',
        coverLetter: 'Với background về mobile development và Flutter...',
        experience: '5 năm',
        skills: ['Flutter', 'Dart', 'Firebase', 'React Native'],
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString()
      }
    ];

    // Filter by status and search
    let filteredApplications = sampleApplications;
    
    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.status === status);
    }
    
    if (search) {
      filteredApplications = filteredApplications.filter(app => 
        app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedApplications = filteredApplications.slice(startIndex, startIndex + limitNum);

    console.log('✅ [ADMIN APPLICATIONS] Returning applications:', paginatedApplications.length);
    
    return NextResponse.json({ 
      success: true, 
      data: paginatedApplications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredApplications.length,
        totalPages: Math.ceil(filteredApplications.length / limitNum)
      }
    });
  } catch (err) {
    console.error('💥 [ADMIN APPLICATIONS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

