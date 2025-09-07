import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../lib/api';

export const dynamic = "force-dynamic";

// POST - Tạo job mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      company,
      location,
      salary,
      tags,
      isRemote,
      type,
      description,
      requirements,
      benefits,
      deadline,
      img,
    } = body;

    // Kiểm tra các trường bắt buộc
    if (!title || !company || !location || !type || !description || !deadline || !img) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Chuẩn bị dữ liệu job mới
    const newJobData = {
      title,
      company,
      location,
      salary: salary?.toString() || 'Thỏa thuận',
      tags: tags ?? [],
      isRemote: isRemote ?? false,
      type,
      description,
      requirements: requirements ?? [],
      benefits: benefits ?? [],
      deadline: new Date(deadline).toISOString(),
      status: 'pending', // Mặc định là pending, cần admin duyệt
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      img,
    };

    // Gọi API để tạo job mới
    const response = await apiClient.jobs.create(newJobData);

    return NextResponse.json(
      { success: true, data: response.data }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi tạo job mới:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo công việc mới' 
      },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách job theo status
export async function GET(request: NextRequest) {
  console.log('=== NEWJOBS API ROUTE CALLED ===');
  console.log('Request URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    console.log('Status filter from URL:', status);

    // Call backend API directly to get hirings data from MongoDB
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    
    // Build query parameters for hirings API
    const queryParams = new URLSearchParams();
    if (status && status !== 'all' && status !== '') {
      queryParams.append('status', status);
    } else {
      // Get all hirings if no specific status filter
      queryParams.append('status', 'approved');
    }
    
    const response = await fetch(`${backendUrl}/api/hirings?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const hiringsData = await response.json();
    console.log('Backend response data:', hiringsData);
    console.log('Data type:', typeof hiringsData);
    console.log('Is array:', Array.isArray(hiringsData));
    
    // Backend returns array directly, we need to wrap it in the expected format
    let jobs = Array.isArray(hiringsData) ? hiringsData : [];
    console.log('Jobs count from backend:', jobs.length);
    
    // If no jobs from backend, provide some sample data for testing
    if (jobs.length === 0) {
      console.log('No jobs from backend, providing sample data');
      jobs = [
        {
          _id: 'sample-1',
          title: 'Frontend Developer React',
          company: 'TechCorp Vietnam',
          location: 'Hồ Chí Minh',
          type: 'Full-time',
          salary: '25.000.000 - 35.000.000 VND',
          description: 'Chúng tôi đang tìm kiếm một Frontend Developer có kinh nghiệm với React để tham gia vào dự án phát triển ứng dụng web.',
          requirements: ['Kinh nghiệm 2+ năm với React', 'Thành thạo JavaScript/TypeScript', 'Hiểu biết về CSS/SCSS'],
          benefits: ['Lương thưởng hấp dẫn', 'Bảo hiểm y tế', 'Môi trường làm việc trẻ trung'],
          tags: ['React', 'JavaScript', 'TypeScript'],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          postedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isRemote: false,
          img: '/img/tech.jpg'
        },
        {
          _id: 'sample-2',
          title: 'Backend Developer Node.js',
          company: 'StartupHub',
          location: 'Hà Nội',
          type: 'Full-time',
          salary: '20.000.000 - 30.000.000 VND',
          description: 'Tham gia phát triển backend cho ứng dụng fintech với Node.js và MongoDB.',
          requirements: ['Kinh nghiệm Node.js/Express', 'Hiểu biết về MongoDB', 'Kiến thức về RESTful API'],
          benefits: ['Stock options', 'Flexible working hours', 'Remote work'],
          tags: ['Node.js', 'MongoDB', 'Express'],
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          postedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isRemote: true,
          img: '/img/startup.jpg'
        }
      ];
    }

    // Transform MongoDB hirings data to match expected format
    const transformedJobs = jobs.map((hiring: any) => {
      console.log('Processing hiring:', hiring);
      return {
        id: hiring._id || hiring.id,
        title: hiring.title || hiring.jobTitle,
        company: hiring.company || hiring.companyName,
        location: hiring.location || hiring.workLocation,
        type: hiring.type || hiring.jobType || 'Full-time',
        salary: hiring.salary || hiring.salaryRange || 'Thỏa thuận',
        description: hiring.description || hiring.jobDescription,
        requirements: hiring.requirements || hiring.jobRequirements || [],
        benefits: hiring.benefits || hiring.jobBenefits || [],
        tags: hiring.tags || hiring.skills || [],
        deadline: hiring.deadline || hiring.applicationDeadline,
        status: hiring.status || 'pending',
        postedDate: hiring.postedDate || hiring.createdAt || hiring.datePosted,
        createdAt: hiring.createdAt,
        isRemote: hiring.isRemote || hiring.remoteWork || false,
        img: hiring.img || hiring.image || hiring.companyLogo || ''
      };
    });
    
    console.log('Transformed jobs:', transformedJobs);

    // Lọc theo status nếu có
    let filteredJobs = transformedJobs;
    if (status && status !== 'all' && status !== '') {
      filteredJobs = transformedJobs.filter((job: any) => job.status === status);
      console.log(`Filtered to ${filteredJobs.length} jobs with status: ${status}`);
    }

    console.log(`Returning ${filteredJobs.length} jobs`);

    return NextResponse.json({ 
      success: true, 
      data: filteredJobs,
      timestamp: new Date().toISOString(),
      params: { status: status || 'all' }
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách công việc:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách công việc' 
      },
      { status: 500 }
    );
  }
}
