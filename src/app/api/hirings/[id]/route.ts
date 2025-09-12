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
    console.log(`🔍 [HIRINGS API] Fetching hiring with ID: ${hiringId}`);

    // Try backend API first
    try {
      const backendUrl = `https://vieclabbe.onrender.com/api/hirings/${hiringId}`;
      console.log(`🔍 [HIRINGS API] Calling backend: ${backendUrl}`);
      
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
        console.log(`✅ [HIRINGS API] Backend response:`, backendData);
        
        // Handle backend response format
        if (backendData.success && backendData.data) {
          return NextResponse.json({
            success: true,
            data: backendData.data,
            message: 'Lấy thông tin tuyển dụng thành công từ backend'
          });
        } else if (backendData) {
          return NextResponse.json({
            success: true,
            data: backendData,
            message: 'Lấy thông tin tuyển dụng thành công từ backend'
          });
        }
      } else {
        console.log(`⚠️ [HIRINGS API] Backend returned ${response.status}, falling back to mock data`);
      }
    } catch (backendError) {
      console.log(`⚠️ [HIRINGS API] Backend error, falling back to mock data:`, backendError);
    }

    // Fallback to mock data
    let mockHirings: any[] = [];
    try {
      const data = await fs.readFile(MOCK_STORAGE_PATH, 'utf8');
      mockHirings = JSON.parse(data);
      console.log(`📊 [HIRINGS API] Loaded ${mockHirings.length} mock hirings from file`);
    } catch (error) {
      console.log(`⚠️ [HIRINGS API] No mock data found`);
      mockHirings = [];
    }

    // Find the hiring in mock data
    const hiring = mockHirings.find(hiring => hiring.id === hiringId || hiring._id === hiringId);
    if (!hiring) {
      console.log(`❌ [HIRINGS API] Hiring not found in mock data either`);
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tin tuyển dụng' },
        { status: 404 }
      );
    }

    console.log(`✅ [HIRINGS API] Found hiring in mock data:`, hiring.title);
    return NextResponse.json({
      success: true,
      data: hiring,
      message: 'Lấy thông tin tuyển dụng thành công từ mock data'
    });

  } catch (error: any) {
    console.error(`💥 [HIRINGS API] Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi lấy thông tin tuyển dụng' },
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