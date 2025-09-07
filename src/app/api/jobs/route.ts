import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// GET /api/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [JOBS API] GET request received');
    
    // Sample jobs data - replace this with your actual database query
    const jobs = [
      {
        id: 'job-1',
        title: 'Frontend Developer React',
        company: 'TechCorp Vietnam',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        salary: '25.000.000 - 35.000.000 VND',
        status: 'active',
        postedDate: '2024-01-10',
        deadline: '2024-02-10',
        description: 'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với React.',
        requirements: ['React', 'JavaScript', 'TypeScript'],
        benefits: ['Lương cao', 'Bảo hiểm', 'Remote work'],
        tags: ['React', 'Frontend', 'JavaScript'],
        isRemote: false,
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        id: 'job-2',
        title: 'Backend Developer Node.js',
        company: 'StartupHub',
        location: 'Hà Nội',
        type: 'Full-time',
        salary: '20.000.000 - 30.000.000 VND',
        status: 'pending',
        postedDate: '2024-01-08',
        deadline: '2024-02-08',
        description: 'Tham gia phát triển backend cho ứng dụng fintech.',
        requirements: ['Node.js', 'MongoDB', 'Express'],
        benefits: ['Stock options', 'Flexible hours'],
        tags: ['Node.js', 'Backend', 'MongoDB'],
        isRemote: true,
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-08').toISOString()
      },
      {
        id: 'job-3',
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'Đà Nẵng',
        type: 'Part-time',
        salary: '15.000.000 - 20.000.000 VND',
        status: 'pending',
        postedDate: '2024-01-12',
        deadline: '2024-02-12',
        description: 'Thiết kế giao diện người dùng cho các ứng dụng mobile và web.',
        requirements: ['Figma', 'Sketch', 'Adobe XD'],
        benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo'],
        tags: ['UI/UX', 'Design', 'Figma'],
        isRemote: false,
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString()
      },
      {
        id: 'job-4',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'Remote',
        type: 'Full-time',
        salary: '30.000.000 - 40.000.000 VND',
        status: 'active',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        description: 'Quản lý hạ tầng cloud và CI/CD pipelines.',
        requirements: ['AWS', 'Docker', 'Kubernetes'],
        benefits: ['Remote 100%', 'Lương cao', 'Flexible hours'],
        tags: ['DevOps', 'AWS', 'Docker'],
        isRemote: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'job-5',
        title: 'Mobile Developer Flutter',
        company: 'AppStudio',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        salary: '28.000.000 - 38.000.000 VND',
        status: 'active',
        postedDate: '2024-01-18',
        deadline: '2024-02-18',
        description: 'Phát triển ứng dụng mobile cross-platform với Flutter.',
        requirements: ['Flutter', 'Dart', 'Firebase'],
        benefits: ['Lương cao', 'Tham gia dự án thú vị'],
        tags: ['Flutter', 'Mobile', 'Dart'],
        isRemote: false,
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString()
      }
    ];

    console.log('✅ [JOBS API] Returning', jobs.length, 'jobs');
    
    return NextResponse.json(jobs);
  } catch (err) {
    console.error('💥 [JOBS API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      benefits,
      deadline,
      image,
    } = await req.json();

    // Validate required fields
    if (!title || !company || !location || !type || !salary || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new job using the API client
    // const response = await apiClient.jobs.create({
    //   title,
    //   company,
    //   location,
    //   type,
    //   salary: salary || null,
    //   description,
    //   requirements: requirements || [],
    //   benefits: benefits || [],
    //   image: image || null,
    //   status: 'pending',
    // });
    
    // const job = response.data;
    // return NextResponse.json(job, { status: 201 });
    return NextResponse.json({ message: 'POST endpoint is not implemented yet' }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}