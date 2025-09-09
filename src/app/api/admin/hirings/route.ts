import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/hirings
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN HIRINGS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN HIRINGS] Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    console.log('🔍 [ADMIN HIRINGS] Query params:', { status, search, page, limit });

    // Get hirings from backend API
    try {
      console.log('🔍 [ADMIN HIRINGS] Calling backend API...');
      
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
      
      const response = await fetch(`${backendUrl}/api/hirings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 [ADMIN HIRINGS] Backend response status:', response.status);
      
      if (response.ok) {
        const backendData = await response.json();
        console.log('✅ [ADMIN HIRINGS] Backend response data:', backendData);
        
        // Handle different backend response formats
        let hirings = [];
        if (backendData.success && backendData.data && Array.isArray(backendData.data)) {
          hirings = backendData.data;
        } else if (Array.isArray(backendData)) {
          hirings = backendData;
        }
        
        console.log('✅ [ADMIN HIRINGS] Processed', hirings.length, 'hirings');
        
        return NextResponse.json({
          success: true,
          data: hirings,
          pagination: backendData.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: hirings.length,
            totalPages: Math.ceil(hirings.length / parseInt(limit))
          }
        });
      } else {
        throw new Error(`Backend API error: ${response.status}`);
      }
    } catch (apiError) {
      console.error('💥 [ADMIN HIRINGS] Backend API error:', apiError);
      
      // Return error when backend is not available
      console.log('❌ [ADMIN HIRINGS] Backend API not available');
      return NextResponse.json(
        { success: false, message: 'Backend API không khả dụng. Vui lòng kiểm tra kết nối database.' },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hirings
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] POST request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN HIRINGS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN HIRINGS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN HIRINGS] Request body:', body);

    if (!body.title || !body.company || !body.location) {
      console.log('❌ [ADMIN HIRINGS] Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    }

    // Create new hiring
    const newHiring = {
      id: `hiring-${Date.now()}`,
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type || 'Full-time',
      salary: body.salary || 'Thỏa thuận',
      urgencyLevel: body.urgencyLevel || 'medium',
      description: body.description || '',
      requirements: body.requirements || [],
      benefits: body.benefits || [],
      contactInfo: body.contactInfo || {
        email: 'hr@company.com',
        phone: '0123456789',
        contactPerson: 'HR Manager'
      },
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      postedDate: new Date().toISOString().split('T')[0],
      status: body.status || 'active',
      applicationsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN HIRINGS] Hiring created successfully:', newHiring.id);
    
    return NextResponse.json(
      { success: true, data: newHiring, message: 'Hiring created successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}