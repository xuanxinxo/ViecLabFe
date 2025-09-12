import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

// File path for persistent mock storage
const MOCK_STORAGE_PATH = path.join(process.cwd(), 'mock-hirings.json');

// GET /api/hirings/[id] - Get hiring by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hiringId = params.id;

    // Load mock data
    let mockHirings: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockHirings = JSON.parse(data);
    } catch (error) {
      mockHirings = [];
    }

    // Find the hiring
    const hiring = mockHirings.find(hiring => hiring.id === hiringId || hiring._id === hiringId);
    if (!hiring) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy việc làm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hiring,
      message: 'Lấy thông tin việc làm thành công'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi lấy thông tin việc làm' },
      { status: 500 }
    );
  }
}

// DELETE /api/hirings/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Cần đăng nhập admin để xóa việc làm' },
        { status: 401 }
      );
    }

    const jobId = params.id;

    // Load mock data
    let mockHirings: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockHirings = JSON.parse(data);
    } catch (error) {
      mockHirings = [];
    }

    // Find and remove the job
    const jobIndex = mockHirings.findIndex(job => job.id === jobId || job._id === jobId);
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy việc làm' },
        { status: 404 }
      );
    }

    // Remove job from array
    const deletedJob = mockHirings.splice(jobIndex, 1)[0];

    // Save back to file
    await fs.writeFile(MOCK_STORAGE_PATH, JSON.stringify(mockHirings, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Xóa việc làm thành công',
      data: deletedJob
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xóa việc làm' },
      { status: 500 }
    );
  }
}