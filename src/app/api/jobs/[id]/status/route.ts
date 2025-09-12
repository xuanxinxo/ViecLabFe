import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

// File path for persistent mock storage
const MOCK_STORAGE_PATH = path.join(process.cwd(), 'mock-jobs.json');

// PUT /api/jobs/[id]/status - Update job status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để cập nhật trạng thái' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;
    const jobId = params.id;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái là bắt buộc' },
        { status: 400 }
      );
    }

    // Load mock data
    let mockJobs: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockJobs = JSON.parse(data);
    } catch (error) {
      mockJobs = [];
    }

    // Find and update the job
    const jobIndex = mockJobs.findIndex(job => job.id === jobId || job._id === jobId);
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy việc làm' },
        { status: 404 }
      );
    }

    // Update job status
    mockJobs[jobIndex].status = status;
    mockJobs[jobIndex].updatedAt = new Date().toISOString();

    // Save back to file
    await fs.writeFile(MOCK_STORAGE_PATH, JSON.stringify(mockJobs, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: mockJobs[jobIndex]
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}