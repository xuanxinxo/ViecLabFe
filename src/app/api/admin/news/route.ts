import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/news
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWS] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN NEWS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN NEWS] Admin verified:', admin.username);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    console.log('🔍 [ADMIN NEWS] Query params:', { search, page, limit });

    // Get news from backend API
    try {
      console.log('🔍 [ADMIN NEWS] Calling backend API...');
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
      const queryParams = new URLSearchParams();
      
      if (search) {
        queryParams.append('search', search);
      }
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await fetch(`${backendUrl}/api/news?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 [ADMIN NEWS] Backend response status:', response.status);
      
      if (response.ok) {
        const backendData = await response.json();
        console.log('✅ [ADMIN NEWS] Backend response data:', backendData);
        
        // Handle different backend response formats
        let news = [];
        if (backendData.success && backendData.data && Array.isArray(backendData.data)) {
          news = backendData.data;
        } else if (Array.isArray(backendData)) {
          news = backendData;
        }
        
        console.log('✅ [ADMIN NEWS] Processed', news.length, 'news articles');
        
        return NextResponse.json({
          success: true,
          data: news,
          pagination: backendData.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: news.length,
            totalPages: Math.ceil(news.length / parseInt(limit))
          }
        });
      } else {
        throw new Error(`Backend API error: ${response.status}`);
      }
    } catch (apiError) {
      console.error('💥 [ADMIN NEWS] Backend API error:', apiError);
      
      // Return error when backend is not available
      console.log('❌ [ADMIN NEWS] Backend API not available');
      return NextResponse.json(
        { success: false, message: 'Backend API không khả dụng. Vui lòng kiểm tra kết nối database.' },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error('💥 [ADMIN NEWS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/news
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN NEWS] POST request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN NEWS] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN NEWS] Admin verified:', admin.username);

    const body = await request.json();
    console.log('📝 [ADMIN NEWS] Request body:', body);

    if (!body.title || !body.summary) {
      console.log('❌ [ADMIN NEWS] Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Title and summary are required' },
        { status: 400 }
      );
    }

    // Create new news
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
      updatedAt: new Date().toISOString()
    };

    console.log('✅ [ADMIN NEWS] News created successfully:', newNews.id);
    
    return NextResponse.json(
      { success: true, data: newNews, message: 'News created successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('💥 [ADMIN NEWS] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}