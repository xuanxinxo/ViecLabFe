import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../lib/api';
import { getAdminFromRequest } from '../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
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
      const response = NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    return addCorsHeaders(response);
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

    const response = NextResponse.json(
      { success: true, data: response.data }, 
      { status: 201 }
    );
    return addCorsHeaders(response);
  } catch (error: any) {
    console.error('Lỗi khi tạo job mới:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo công việc mới' 
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// GET - Lấy danh sách newjobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWJOBS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN NEWJOBS] Unauthorized access');
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    console.log('✅ [ADMIN NEWJOBS] Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    console.log('🔍 [ADMIN NEWJOBS] Query params:', { status, page, limit, search });

    // Call backend API to get hirings data
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    
    try {
      const queryParams = new URLSearchParams();
      if (status && status !== 'all' && status !== '') {
        queryParams.append('status', status);
      }
      
      const response = await fetch(`${backendUrl}/api/hirings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Backend response status: ${response.status}`);

      if (response.ok) {
        const hiringsData = await response.json();
        let jobs = Array.isArray(hiringsData) ? hiringsData : (hiringsData.data || []);
        
        console.log('✅ [ADMIN NEWJOBS] Real data loaded:', jobs.length);

        // Transform data to match expected format
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

        // Filter by search if provided
        let filteredJobs = transformedJobs;
        if (search) {
          filteredJobs = transformedJobs.filter((job: any) => 
            job.title?.toLowerCase().includes(search.toLowerCase()) ||
            job.company?.toLowerCase().includes(search.toLowerCase()) ||
            job.location?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitNum);

        console.log('✅ [ADMIN NEWJOBS] Returning jobs:', paginatedJobs.length);
        
        const response = NextResponse.json({ 
          success: true, 
          data: paginatedJobs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredJobs.length,
            totalPages: Math.ceil(filteredJobs.length / limitNum);
    return addCorsHeaders(response);
          }
        });
      } else {
        throw new Error(`Backend API error: ${response.status}`);
      }
    } catch (apiError) {
      console.error('💥 [ADMIN NEWJOBS] Backend API error:', apiError);
      
      // Return empty array instead of mock data
      console.log('✅ [ADMIN NEWJOBS] Returning empty array due to backend error');
      
      const response = NextResponse.json({ 
        success: true, 
        data: [],
        pagination: {
          page: parseInt(page);
    return addCorsHeaders(response);,
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    }
  } catch (error: any) {
    console.error('💥 [ADMIN NEWJOBS] Error:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách công việc' 
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
