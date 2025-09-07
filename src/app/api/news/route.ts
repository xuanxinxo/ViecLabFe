import { NextRequest, NextResponse } from 'next/server';

// GET: Lấy danh sách tin tức
export async function GET() {
  try {
    console.log('[NEWS API] Fetching mock news data...');
    
    // Mock data for news
    const mockNews = [
      {
        _id: 'news-1',
        title: 'Xu hướng công nghệ ngành F&B năm 2024',
        summary: 'Ngành F&B đang trải qua những thay đổi lớn với sự phát triển của công nghệ AI, IoT và automation. Các nhà hàng đang áp dụng những giải pháp công nghệ mới để nâng cao trải nghiệm khách hàng.',
        date: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
        link: 'https://example.com/news/1',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        _id: 'news-2',
        title: 'Toredco ra mắt dịch vụ tư vấn chiến lược kinh doanh mới',
        summary: 'Công ty Toredco chính thức ra mắt dịch vụ tư vấn chiến lược kinh doanh toàn diện, hỗ trợ các doanh nghiệp vừa và nhỏ phát triển bền vững trong thời đại số.',
        date: '2024-01-12',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
        link: 'https://example.com/news/2',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString()
      },
      {
        _id: 'news-3',
        title: 'Hướng dẫn setup hệ thống POS cho nhà hàng',
        summary: 'Hệ thống POS (Point of Sale) hiện đại không chỉ giúp quản lý bán hàng mà còn tích hợp nhiều tính năng như quản lý kho, báo cáo doanh thu và phân tích khách hàng.',
        date: '2024-01-10',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
        link: 'https://example.com/news/3',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        _id: 'news-4',
        title: 'Công nghệ AI trong ngành dịch vụ ăn uống',
        summary: 'Trí tuệ nhân tạo đang cách mạng hóa ngành dịch vụ ăn uống với các ứng dụng từ chatbot đặt hàng, phân tích sở thích khách hàng đến tối ưu hóa menu và dự báo nhu cầu.',
        date: '2024-01-08',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop',
        link: 'https://example.com/news/4',
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-08').toISOString()
      },
      {
        _id: 'news-5',
        title: 'Toredco tổ chức hội thảo "Digital Transformation in F&B"',
        summary: 'Sự kiện hội thảo chuyên đề về chuyển đổi số trong ngành F&B sẽ diễn ra vào tháng 2/2024, quy tụ các chuyên gia hàng đầu và doanh nghiệp tiêu biểu trong lĩnh vực.',
        date: '2024-01-05',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=300&fit=crop',
        link: 'https://example.com/news/5',
        createdAt: new Date('2024-01-05').toISOString(),
        updatedAt: new Date('2024-01-05').toISOString()
      }
    ];
    
    console.log(`[NEWS API] Returning ${mockNews.length} news items`);
    
    return NextResponse.json({ news: mockNews });
  } catch (err) {
    console.error('Error in news API:', err);
    
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tải danh sách tin tức',
        details: process.env.NODE_ENV === 'development' ? {
          message: err instanceof Error ? err.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
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

    return NextResponse.json(
      { success: true, news: newNewsItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news item:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tin tức mới' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa tin tức
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID tin tức' },
        { status: 400 }
      );
    }
    
    // Mock delete - in real app, this would delete from database
    console.log(`Mock deleting news with ID: ${id}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Tin tức đã được xóa thành công' 
    });
    
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa tin tức' },
      { status: 500 }
    );
  }
}
