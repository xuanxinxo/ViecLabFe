import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// Helper thêm CORS
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

// ============================
// GET /api/admin/hirings
// ============================
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] GET request received');

    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ Unauthorized access');
      return withCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }));
    }

    console.log('✅ Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log('🔍 Query params:', { status, search, page, limit });

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const queryParams = new URLSearchParams();

    if (status !== 'all') queryParams.append('status', status);
    if (search) queryParams.append('search', search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const res = await fetch(`${backendUrl}/api/hirings?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status}`);
    }

    const backendData = await res.json();

    // Chuẩn hoá data
    let hirings: any[] = [];
    if (backendData.success && Array.isArray(backendData.data)) {
      hirings = backendData.data;
    } else if (Array.isArray(backendData)) {
      hirings = backendData;
    }

    console.log(`✅ Processed ${hirings.length} hirings`);

    return withCORS(
      NextResponse.json({
        success: true,
        data: hirings,
        pagination: backendData.pagination || {
          page,
          limit,
          total: hirings.length,
          totalPages: Math.ceil(hirings.length / limit),
        },
      })
    );
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return withCORS(
      NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    );
  }
}

// ============================
// POST /api/admin/hirings
// ============================
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN HIRINGS] POST request received');

    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ Unauthorized access');
      return withCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }));
    }

    console.log('✅ Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 Request body:', body);

    if (!body.title || !body.company || !body.location) {
      return withCORS(
        NextResponse.json({ success: false, message: 'Title, company, and location are required' }, { status: 400 })
      );
    }

    // Mock create new hiring
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
        contactPerson: 'HR Manager',
      },
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      postedDate: new Date().toISOString().split('T')[0],
      status: body.status || 'active',
      applicationsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('✅ Hiring created successfully:', newHiring.id);

    return withCORS(
      NextResponse.json({ success: true, data: newHiring, message: 'Hiring created successfully' }, { status: 201 })
    );
  } catch (err) {
    console.error('💥 [ADMIN HIRINGS] Error:', err);
    return withCORS(
      NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
    );
  }
}
