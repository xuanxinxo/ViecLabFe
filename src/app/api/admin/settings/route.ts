import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// Mock settings data - trong thực tế sẽ lưu trong database
let systemSettings = {
  siteName: 'TOREDCO Jobs',
  siteDescription: 'Nền tảng tìm kiếm việc làm hàng đầu',
  contactEmail: 'admin@toredco.com',
  contactPhone: '+84 123 456 789',
  maxJobsPerPage: 10,
  maxApplicationsPerPage: 20,
  jobApprovalRequired: true,
  applicationAutoApprove: false,
  maintenanceMode: false,
  allowUserRegistration: true,
  emailNotifications: true,
  smsNotifications: false,
  socialLogin: {
    google: true,
    facebook: false,
    linkedin: false
  },
  seoSettings: {
    metaTitle: 'TOREDCO Jobs - Tìm việc làm tốt nhất',
    metaDescription: 'Tìm kiếm việc làm phù hợp với kỹ năng và kinh nghiệm của bạn',
    metaKeywords: 'việc làm, tuyển dụng, job, career'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
};

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    const response = NextResponse.json({ 
      success: true, 
      data: systemSettings 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error fetching settings:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.siteName || !body.contactEmail) {
      const response = NextResponse.json(
        { success: false, message: 'Site name and contact email are required' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }

    // Cập nhật settings
    systemSettings = {
      ...systemSettings,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.username
    };

    // Trong thực tế, lưu vào database ở đây
    // await saveSettingsToDatabase(systemSettings);
    
    const response = NextResponse.json({ 
      success: true, 
      data: systemSettings,
      message: 'Settings updated successfully' 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error('Error updating settings:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

