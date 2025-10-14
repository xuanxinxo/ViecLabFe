import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// ✅ Helper để thêm CORS headers
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// ✅ OPTIONS handler cho CORS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

// ✅ GET /api/admin/jobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN JOBS] GET request received');

    // Xác thực admin
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN JOBS] Unauthorized access');
      return withCORS(
        NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      );
    }

    console.log('✅ [ADMIN JOBS] Admin verified:', admin.username);

    const status = request.nextUrl.searchParams.get('status');
    console.log('🔍 [ADMIN JOBS] Status filter:', status);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const queryParams = status && status !== 'all' ? `?status=${status}` : '';
    const apiUrl = `${backendUrl}/api/jobs${queryParams}`;

    console.log('🔍 [ADMIN JOBS] Backend URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    console.log('🔍 [ADMIN JOBS] Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const backendJobs = await response.json();

    // Chuẩn hóa dữ liệu trả về
    let jobsData: any[] = [];
    if (Array.isArray(backendJobs)) {
      jobsData = backendJobs;
    } else if (backendJobs?.data && Array.isArray(backendJobs.data)) {
      jobsData = backendJobs.data;
    } else if (backendJobs?.jobs && Array.isArray(backendJobs.jobs)) {
      jobsData = backendJobs.jobs;
    } else {
      throw new Error('Backend response format not recognized');
    }

    const transformedJobs = jobsData.map(job => ({
      id: job.id || job._id || '',
      _id: job._id || job.id || '',
      title: job.title || 'No Title',
      company: job.company || 'No Company',
      location: job.location || 'Remote',
      type: job.type || 'Full-time',
      salary: job.salary || 'Negotiable',
      status: job.status || 'pending',
      postedDate: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      deadline: job.deadline ? new Date(job.deadline).toISOString() : new Date().toISOString(),
      description: job.description || '',
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      tags: job.tags || [],
      isRemote: job.isRemote || false,
      img: job.img || '',
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return withCORS(
      NextResponse.json({ success: true, data: transformedJobs })
    );

  } catch (error: any) {
    console.error('💥 [ADMIN JOBS] Error:', error);
    return withCORS(
      NextResponse.json(
        { success: false, message: error.message || 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

// ✅ POST /api/admin/jobs
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN JOBS] POST request received');

    // Xác thực admin
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN JOBS] Unauthorized access');
      return withCORS(
        NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      );
    }

    console.log('✅ [ADMIN JOBS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN JOBS] Request body:', body);

    if (!body.title || !body.company || !body.location) {
      return withCORS(
        NextResponse.json(
          { success: false, message: 'Tiêu đề, công ty và địa điểm là bắt buộc' },
          { status: 400 }
        )
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';

    const jobData = {
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type || 'full-time',
      salary: body.salary || 'Negotiable',
      description: body.description || '',
      requirements: body.requirements || [],
      benefits: body.benefits || [],
      tags: body.tags || [],
      isRemote: body.isRemote || false,
      deadline: body.deadline ? new Date(body.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      postedDate: new Date(),
      img: body.img || ''
    };

    const response = await fetch(`${backendUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const createdJob = await response.json();
    console.log('✅ [ADMIN JOBS] Job created successfully via backend:', createdJob);

    return withCORS(
      NextResponse.json(
        { success: true, message: 'Job created successfully', data: createdJob },
        { status: 201 }
      )
    );

  } catch (error: any) {
    console.error('💥 [ADMIN JOBS] Error:', error);
    return withCORS(
      NextResponse.json(
        { success: false, message: error.message || 'Internal server error' },
        { status: 500 }
      )
    );
  }
}
