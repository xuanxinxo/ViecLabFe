import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// PUT /api/jobs/[id]/status - Update job status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Job ID is required' 
      }, { status: 400 });
    }
    
    if (!status) {
      return NextResponse.json({ 
        success: false, 
        message: 'Status is required' 
      }, { status: 400 });
    }
    
    console.log('🔍 [JOBS STATUS API] PUT request for job:', id, 'with status:', status);
    
    // Import mockJobs from the main route (this is a workaround for module sharing)
    // In production, this would be a database operation
    const response = await fetch(`${req.nextUrl.origin}/api/jobs`);
    const jobsData = await response.json();
    
    if (!jobsData.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không thể lấy danh sách việc làm' 
      }, { status: 500 });
    }
    
    // Find the job
    const jobs = jobsData.data.items || [];
    const jobIndex = jobs.findIndex((job: any) => job.id === id || job._id === id);
    
    if (jobIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy việc làm' 
      }, { status: 404 });
    }
    
    // Update job status via main API
    const updateResponse = await fetch(`${req.nextUrl.origin}/api/jobs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status })
    });
    
    if (!updateResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không thể cập nhật trạng thái việc làm' 
      }, { status: 500 });
    }
    
    const result = await updateResponse.json();
    
    console.log('✅ [JOBS STATUS API] Job status updated successfully:', result);
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái việc làm thành "${status}"`,
      data: result.data
    }, { status: 200 });
  } catch (error) {
    console.error('💥 [JOBS STATUS API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi cập nhật trạng thái việc làm' 
    }, { status: 500 });
  }
}