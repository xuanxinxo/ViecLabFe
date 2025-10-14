import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../lib/api';
import { getAdminFromRequest } from '../../../../lib/auth';

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
      const res = NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
      addCors(res);
      return res;
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
      status: 'pending', // Mặc định là pending
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      img,
    };

    // Gọi API backend để tạo job mới
    const apiRes = await apiClient.jobs.create(newJobData);

    const res = NextResponse.json(
      { success: true, data: apiRes.data },
      { status: 201 }
    );
    addCors(res);
    return res;
  } catch (error: any) {
    console.error('💥 [ADMIN NEWJOBS POST] Error:', error);
    const res = NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo công việc mới'
      },
      { status: 500 }
    );
    addCors(res);
    return res;
  }
}

// GET - Lấy danh sách newjobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWJOBS] GET request received');

    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      addCors(res);
      return res;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const queryParams = new URLSearchParams();
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }

    const fetchRes = await fetch(`${backendUrl}/api/hirings?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!fetchRes.ok) throw new Error(`Backend API error: ${fetchRes.status}`);

    const hiringsData = await fetchRes.json();
    let jobs = Array.isArray(hiringsData) ? hiringsData : (hiringsData.data || []);

    // Transform data
    const transformedJobs = jobs.map((hiring: any) => ({
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
    }));

    // Search filter
    let filteredJobs = transformedJobs;
    if (search) {
      filteredJobs = transformedJobs.filter((job: any) =>
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    const res = NextResponse.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit)
      }
    });
    addCors(res);
    return res;
  } catch (error: any) {
    console.error('💥 [ADMIN NEWJOBS GET] Error:', error);
    const res = NextResponse.json(
      {
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách công việc'
      },
      { status: 500 }
    );
    addCors(res);
    return res;
  }
}

// Helper để add CORS headers
function addCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
