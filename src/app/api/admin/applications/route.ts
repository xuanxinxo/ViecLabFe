import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';
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

// GET /api/admin/applications
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN APPLICATIONS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN APPLICATIONS] Unauthorized access');
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    console.log('✅ [ADMIN APPLICATIONS] Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    console.log('🔍 [ADMIN APPLICATIONS] Query params:', { status, search, page, limit });

    // Get applications from backend API
    try {
      console.log('🔍 [ADMIN APPLICATIONS] Calling backend API...');
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
      const queryParams = new URLSearchParams();
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      if (search) {
        queryParams.append('search', search);
      }
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await fetch(`${backendUrl}/api/applications?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 [ADMIN APPLICATIONS] Backend response status:', response.status);
      
      if (response.ok) {
        const backendData = await response.json();
        console.log('✅ [ADMIN APPLICATIONS] Backend response data:', backendData);
        
        // Handle different backend response formats
        let applications = [];
        if (backendData.success && backendData.data && Array.isArray(backendData.data)) {
          applications = backendData.data;
        } else if (Array.isArray(backendData)) {
          applications = backendData;
        }
        
        console.log('✅ [ADMIN APPLICATIONS] Processed', applications.length, 'applications');
        
        const response = NextResponse.json({
          success: true,
          data: applications,
          pagination: backendData.pagination || {
            page: parseInt(page);
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;,
            limit: parseInt(limit),
            total: applications.length,
            totalPages: Math.ceil(applications.length / parseInt(limit))
          }
        });
      } else {
        throw new Error(`Backend API error: ${response.status}`);
      }
    } catch (apiError) {
      console.error('💥 [ADMIN APPLICATIONS] Backend API error:', apiError);
      
      // Return error when backend is not available
      console.log('❌ [ADMIN APPLICATIONS] Backend API not available');
      const response = NextResponse.json(
        { success: false, message: 'Backend API không khả dụng. Vui lòng kiểm tra kết nối database.' },
        { status: 503 }
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }
  } catch (err) {
    console.error('💥 [ADMIN APPLICATIONS] Error:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}

// POST /api/admin/applications
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN APPLICATIONS] POST request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN APPLICATIONS] Unauthorized access');
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    console.log('✅ [ADMIN APPLICATIONS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN APPLICATIONS] Request body:', body);

    if (!body.applicantName || !body.email || !body.jobId) {
      console.log('❌ [ADMIN APPLICATIONS] Missing required fields');
      const response = NextResponse.json(
        { success: false, message: 'Applicant name, email, and job ID are required' },
        { status: 400 }
      );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
    }

    // Create new application
    const newApplication = {
      id: `app-${Date.now()}`,
      applicantName: body.applicantName,
      email: body.email,
      phone: body.phone || '',
      jobTitle: body.jobTitle || 'Unknown Position',
      jobId: body.jobId,
      company: body.company || 'Unknown Company',
      appliedDate: new Date().toISOString().split('T')[0],
      status: body.status || 'pending',
      resume: body.resume || '',
      coverLetter: body.coverLetter || '',
      experience: body.experience || '',
      skills: body.skills || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN APPLICATIONS] Application created successfully:', newApplication.id);
    
    const response = NextResponse.json(
      { success: true, data: newApplication, message: 'Application created successfully' },
      { status: 201 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  } catch (err) {
    console.error('💥 [ADMIN APPLICATIONS] Error:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
return response;
  }
}