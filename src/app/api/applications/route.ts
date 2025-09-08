import { NextResponse } from "next/server";
// import { apiClient } from "@/lib/api";
import { apiClient } from '../../../lib/api';
import { getUserFromRequest } from "../../../lib/auth";

export async function POST(req: Request) {
  console.log('[APPLICATIONS] POST request received');
  
  // Tạm thời bỏ authentication để test
  // const user = getUserFromRequest(req);
  // if (!user) {
  //   console.log('[APPLICATIONS] Unauthorized access attempt');
  //   return NextResponse.json({ 
  //     success: false, 
  //     message: 'Bạn cần đăng nhập để ứng tuyển' 
  //   }, { status: 401 });
  // }
  
  try {
    const requestData = await req.json();
    console.log('[APPLICATIONS] Request data:', requestData);
    
    const { jobId, hiringId, name, email, phone, message, cv } = requestData;
    
    if (!jobId && !hiringId) {
      console.error('[APPLICATIONS] Missing jobId and hiringId');
      return NextResponse.json({ 
        success: false, 
        message: 'Thiếu jobId hoặc hiringId' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!name || !email) {
      console.error('[APPLICATIONS] Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      }, { status: 400 });
    }
    
    // Create application using the API client
    console.log('[APPLICATIONS] Creating application with data:', {
      jobId: jobId || undefined,
      hiringId: hiringId || undefined,
      name,
      email,
      phone: phone || '',
      message: message || '',
      cv: cv || ''
    });
    
    const response = await apiClient.applications.create({
      jobId: jobId || undefined,
      hiringId: hiringId || undefined,
      name,
      email,
      phone: phone || '',
      message: message || '',
      cv: cv || ''
    });
    
    console.log('[APPLICATIONS] Application created successfully:', response.data);
    return NextResponse.json({ 
      success: true, 
      data: response.data 
    });
    
  } catch (err) {
    console.error('[APPLICATIONS] Error creating application:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi server khi tạo đơn ứng tuyển',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  console.log('[APPLICATIONS] GET request received');
  
  try {
    // Call backend API to get real applications
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    console.log('[APPLICATIONS] Calling backend API:', `${backendUrl}/api/applications`);
    
    const response = await fetch(`${backendUrl}/api/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('[APPLICATIONS] Backend API error:', response.status, response.statusText);
      throw new Error(`Backend API error: ${response.status}`);
    }

    const backendData = await response.json();
    console.log('[APPLICATIONS] Backend response:', backendData);
    
    if (backendData.success && backendData.data) {
      console.log(`[APPLICATIONS] Returning ${backendData.data.length} real applications from backend`);
      return NextResponse.json({ 
        success: true, 
        data: backendData.data,
        count: backendData.data.length
      });
    } else {
      console.error('[APPLICATIONS] Backend response format invalid:', backendData);
      throw new Error('Invalid backend response format');
    }
    
  } catch (err) {
    console.error('[APPLICATIONS] Error in GET handler:', err);
    
    // Return empty array if backend is not available
    console.log('[APPLICATIONS] Backend not available, returning empty array');
    return NextResponse.json(
      { 
        success: true, 
        data: [],
        count: 0
      }
    );
  }
} 