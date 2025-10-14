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

// GET /api/admin/news
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWS] GET request received');

    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      addCors(res);
      return res;
    }

    console.log('✅ [ADMIN NEWS] Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const fetchRes = await fetch(`${backendUrl}/api/news?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!fetchRes.ok) throw new Error(`Backend API error: ${fetchRes.status}`);

    const backendData = await fetchRes.json();
    let news: any[] = [];

    if (backendData.success && Array.isArray(backendData.data)) {
      news = backendData.data;
    } else if (Array.isArray(backendData)) {
      news = backendData;
    }

    const res = NextResponse.json({
      success: true,
      data: news,
      pagination: backendData.pagination || {
        page,
        limit,
        total: news.length,
        totalPages: Math.ceil(news.length / limit),
      }
    });
    addCors(res);
    return res;
  } catch (err: any) {
    console.error('💥 [ADMIN NEWS GET] Error:', err);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    addCors(res);
    return res;
  }
}

// POST /api/admin/news
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWS] POST request received');

    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      addCors(res);
      return res;
    }

    const body = await request.json();
    if (!body.title || !body.summary) {
      const res = NextResponse.json({ success: false, message: 'Title and summary are required' }, { status: 400 });
      addCors(res);
      return res;
    }

    // Fake create news (có thể thay bằng gọi API backend)
    const newNews = {
      id: `news-${Date.now()}`,
      title: body.title,
      summary: body.summary,
      content: body.content || '',
      link: body.link || '',
      imageUrl: body.imageUrl || '',
      date: body.date || new Date().toISOString().split('T')[0],
      author: body.author || 'TOREDCO Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = NextResponse.json(
      { success: true, data: newNews, message: 'News created successfully' },
      { status: 201 }
    );
    addCors(res);
    return res;
  } catch (err: any) {
    console.error('💥 [ADMIN NEWS POST] Error:', err);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    addCors(res);
    return res;
  }
}

// Helper để add CORS headers
function addCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
