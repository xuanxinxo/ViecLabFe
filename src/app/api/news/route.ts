import { NextRequest, NextResponse } from 'next/server';

// GET: Lấy danh sách tin tức

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

export async function GET(request: NextRequest) {
  try {
    console.log('[NEWS API] Fetching news from backend...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = searchParams.toString();
    
    // Call backend API
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');
    
    let news = [];
    
    try {
      const response = await fetch(`${backendUrl}/api/news?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // No timeout - let requests wait as long as needed
      });
      
      if (response.ok) {
        const newsData = await response.json();
        news = Array.isArray(newsData) ? newsData : (newsData.data || []);
        console.log(`[NEWS API] Got ${news.length} news items from backend`);
      } else {
        console.warn(`[NEWS API] Backend error: ${response.status}, using fallback data`);
      }
    } catch (fetchError) {
      console.warn('[NEWS API] Backend not accessible, using fallback data:', fetchError);
    }
    
    // Fallback to mock data if backend fails
    if (news.length === 0) {
      console.log('[NEWS API] Using fallback mock data');
      news = [
        {
          _id: 'news-1',
          title: 'Xu hướng công nghệ ngành F&B năm 2024',
          summary: 'Ngành F&B đang trải qua những thay đổi lớn với sự phát triển của công nghệ AI, IoT và automation.',
          date: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
          link: 'https://example.com/news/1',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString()
        },
        {
          _id: 'news-2',
          title: 'Toredco ra mắt dịch vụ tư vấn chiến lược kinh doanh mới',
          summary: 'Công ty Toredco chính thức ra mắt dịch vụ tư vấn chiến lược kinh doanh toàn diện.',
          date: '2024-01-12',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
          link: 'https://example.com/news/2',
          createdAt: new Date('2024-01-12').toISOString(),
          updatedAt: new Date('2024-01-12').toISOString()
        },
        {
          _id: 'news-3',
          title: 'Hướng dẫn setup hệ thống POS cho nhà hàng',
          summary: 'Hệ thống POS hiện đại không chỉ giúp quản lý bán hàng mà còn tích hợp nhiều tính năng.',
          date: '2024-01-10',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
          link: 'https://example.com/news/3',
          createdAt: new Date('2024-01-10').toISOString(),
          updatedAt: new Date('2024-01-10').toISOString()
        },
        {
          _id: 'news-4',
          title: 'Công nghệ AI trong ngành dịch vụ ăn uống',
          summary: 'Trí tuệ nhân tạo đang cách mạng hóa ngành dịch vụ ăn uống với các ứng dụng từ chatbot.',
          date: '2024-01-08',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop',
          link: 'https://example.com/news/4',
          createdAt: new Date('2024-01-08').toISOString(),
          updatedAt: new Date('2024-01-08').toISOString()
        }
      ];
    }
    
    console.log(`[NEWS API] Returning ${news.length} news items`);
    
    const response = NextResponse.json({
      success: true,
      data: news,
      count: news.length
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (err) {
    console.error('Error in news API:', err);
    
    const response = NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tải danh sách tin tức',
        details: process.env.NODE_ENV === 'development' ? {
          message: err instanceof Error ? err.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}

// POST: Tạo tin tức mới
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const summary = formData.get('summary')?.toString() || '';
    const date = formData.get('date')?.toString() || '';
    const link = formData.get('link')?.toString() || '';
    const imageFile = formData.get('image') as File | null;

    if (!title || !summary || !date) {
      const response = NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // Mock create news item
    const newNewsItem = {
      _id: `news-${Date.now()}`,
      title,
      summary,
      date,
      link: link || '',
      image: imageFile ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = NextResponse.json(
      { success: true, news: newNewsItem },
      { status: 201 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Error creating news item:', error);
    const response = NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tin tức mới' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}

// DELETE: Xóa tin tức
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      const response = NextResponse.json(
        { error: 'Thiếu ID tin tức' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }
    
    // Mock delete - in real app, this would delete from database
    console.log(`Mock deleting news with ID: ${id}`);
    
    const response = NextResponse.json({ 
      success: true,
      message: 'Tin tức đã được xóa thành công' 
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
    
  } catch (error) {
    console.error('Error deleting news:', error);
    const response = NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa tin tức' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}
