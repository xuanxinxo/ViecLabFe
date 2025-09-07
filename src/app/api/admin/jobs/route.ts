import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/jobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN JOBS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN JOBS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN JOBS] Admin verified:', admin.username);

    const status = request.nextUrl.searchParams.get('status');
    console.log('🔍 [ADMIN JOBS] Status filter:', status);
    
    // Get jobs from backend API
    try {
      console.log('🔍 [ADMIN JOBS] Calling backend API...');
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
      const queryParams = status && status !== 'all' ? `?status=${status}` : '';
      
      console.log('🔍 [ADMIN JOBS] Backend URL:', `${backendUrl}/api/jobs${queryParams}`);
      
      const response = await fetch(`${backendUrl}/api/jobs${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 [ADMIN JOBS] Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const backendJobs = await response.json();
      console.log('✅ [ADMIN JOBS] Backend response data:', backendJobs);
      console.log('✅ [ADMIN JOBS] Backend response type:', typeof backendJobs);
      console.log('✅ [ADMIN JOBS] Backend response is array:', Array.isArray(backendJobs));
      
      // Handle different backend response formats
      let jobsData = null;
      
      if (Array.isArray(backendJobs)) {
        jobsData = backendJobs;
        console.log('✅ [ADMIN JOBS] Backend returned array with', jobsData.length, 'jobs');
      } else if (backendJobs && typeof backendJobs === 'object' && 'data' in backendJobs && Array.isArray(backendJobs.data)) {
        jobsData = backendJobs.data;
        console.log('✅ [ADMIN JOBS] Backend returned data.data with', jobsData.length, 'jobs');
      } else if (backendJobs && typeof backendJobs === 'object' && 'jobs' in backendJobs && Array.isArray(backendJobs.jobs)) {
        jobsData = backendJobs.jobs;
        console.log('✅ [ADMIN JOBS] Backend returned data.jobs with', jobsData.length, 'jobs');
      } else {
        console.log('❌ [ADMIN JOBS] Backend response format not recognized:', backendJobs);
        throw new Error('Backend response format not recognized');
      }
      
      // Transform the data to match frontend expectations
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
        updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString()
      }));
      
      console.log('✅ [ADMIN JOBS] Transformed', transformedJobs.length, 'jobs');
      
      return NextResponse.json({ success: true, data: transformedJobs });
      
        } catch (apiError) {
      console.error('💥 [ADMIN JOBS] Backend API error:', apiError);
      
      // Return error instead of sample data
      console.log('❌ [ADMIN JOBS] Backend API not available, returning error');
      return NextResponse.json(
        { success: false, message: 'Backend API không khả dụng. Vui lòng kiểm tra kết nối database.' },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error('💥 [ADMIN JOBS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/jobs
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN JOBS] POST request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN JOBS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN JOBS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN JOBS] Request body:', body);

    if (!body.title || !body.company || !body.location) {
      console.log('❌ [ADMIN JOBS] Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend API to create job
    try {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const createdJob = await response.json();
      console.log('✅ [ADMIN JOBS] Job created successfully via backend:', createdJob);

      return NextResponse.json(
        { success: true, message: 'Job created successfully', data: createdJob },
        { status: 201 }
      );
    } catch (apiError) {
      console.error('💥 [ADMIN JOBS] Backend API error:', apiError);
      
      // Return error if backend is not available
      return NextResponse.json(
        { success: false, message: 'Backend API không khả dụng. Vui lòng kiểm tra kết nối database.' },
        { status: 503 }
      );
    }
  } catch (err: any) {
    console.error('💥 [ADMIN JOBS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
