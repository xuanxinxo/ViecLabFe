import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      data: systemSettings 
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.siteName || !body.contactEmail) {
      return NextResponse.json(
        { success: false, message: 'Site name and contact email are required' },
        { status: 400 }
      );
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
    
    return NextResponse.json({ 
      success: true, 
      data: systemSettings,
      message: 'Settings updated successfully' 
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

