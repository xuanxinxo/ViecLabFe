import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
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

// File path for persistent mock storage
const MOCK_STORAGE_PATH = path.join(process.cwd(), 'mock-jobs.json');

// GET /api/jobs/[id] - Get job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    console.log(`🔍 [JOBS API] Fetching job with ID: ${jobId}`);

    // Try backend API first
    try {
      const backendUrl = `https://vieclabbe.onrender.com/api/jobs/${jobId}`;
      console.log(`🔍 [JOBS API] Calling backend: ${backendUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const backendData = await response.json();
        console.log(`✅ [JOBS API] Backend response:`, backendData);
        
        // Handle backend response format
        if (backendData.success && backendData.data) {
          const response = NextResponse.json({
            success: true,
            data: backendData.data,
            message: 'Lấy thông tin việc làm thành công từ backend'
          });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
        } else if (backendData) {
          const response = NextResponse.json({
            success: true,
            data: backendData,
            message: 'Lấy thông tin việc làm thành công từ backend'
          });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
        }
      } else {
        console.log(`⚠️ [JOBS API] Backend returned ${response.status}, falling back to mock data`);
      }
    } catch (backendError) {
      console.log(`⚠️ [JOBS API] Backend error, falling back to mock data:`, backendError);
    }

    // Fallback to mock data
    let mockJobs: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockJobs = JSON.parse(data);
      console.log(`📊 [JOBS API] Loaded ${mockJobs.length} mock jobs from file`);
    } catch (error) {
      console.log(`⚠️ [JOBS API] No mock data found`);
      mockJobs = [];
    }

    // Find the job in mock data
    const job = mockJobs.find(job => job.id === jobId || job._id === jobId);
    if (!job) {
      console.log(`❌ [JOBS API] Job not found in mock data either`);
      const response = NextResponse.json(
        { success: false, message: 'Không tìm thấy việc làm' },
        { status: 404 }
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    console.log(`✅ [JOBS API] Found job in mock data:`, job.title);
    const response = NextResponse.json({
      success: true,
      data: job,
      message: 'Lấy thông tin việc làm thành công từ mock data'
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;

  } catch (error: any) {
    console.error(`💥 [JOBS API] Error:`, error);
    const response = NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi lấy thông tin việc làm' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      const response = NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để xóa việc làm' },
        { status: 401 }
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    const jobId = params.id;

    // Load mock data
    let mockJobs: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockJobs = JSON.parse(data);
    } catch (error) {
      mockJobs = [];
    }

    // Find and remove the job
    const jobIndex = mockJobs.findIndex(job => job.id === jobId || job._id === jobId);
    if (jobIndex === -1) {
      const response = NextResponse.json(
        { success: false, message: 'Không tìm thấy việc làm' },
        { status: 404 }
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    // Remove job from array
    const deletedJob = mockJobs.splice(jobIndex, 1)[0];

    // Save back to file
    await fs.writeFile(MOCK_STORAGE_PATH, JSON.stringify(mockJobs, null, 2));

    const response = NextResponse.json({
      success: true,
      message: 'Xóa việc làm thành công',
      data: deletedJob
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;

  } catch (error: any) {
    const response = NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xóa việc làm' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}