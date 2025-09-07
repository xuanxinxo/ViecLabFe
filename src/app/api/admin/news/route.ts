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

    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const search = request.nextUrl.searchParams.get('search') || '';

    console.log('🔍 [ADMIN NEWS] Query params:', { page, limit, search });

    // Sample news data
    const sampleNews = [
      {
        id: 'news-1',
        title: 'Thị trường việc làm IT tăng trưởng mạnh trong năm 2024',
        summary: 'Nhu cầu tuyển dụng nhân sự IT tiếp tục tăng cao với mức lương hấp dẫn.',
        content: 'Theo báo cáo mới nhất, thị trường việc làm IT Việt Nam ghi nhận mức tăng trưởng 25% so với năm trước...',
        link: '/news/thi-truong-viec-lam-it-2024',
        imageUrl: '/images/it-market-2024.jpg',
        date: '2024-01-15',
        author: 'TOREDCO Admin',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'news-2',
        title: 'Xu hướng Remote Work phổ biến trong các công ty công nghệ',
        summary: 'Làm việc từ xa trở thành xu hướng chính, mang lại nhiều lợi ích cho cả nhân viên và doanh nghiệp.',
        content: 'Remote work không chỉ là xu hướng tạm thời mà đã trở thành một phần không thể thiếu...',
        link: '/news/remote-work-trend',
        imageUrl: '/images/remote-work.jpg',
        date: '2024-01-10',
        author: 'TOREDCO Admin',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        id: 'news-3',
        title: 'Kỹ năng AI và Machine Learning được săn đón nhất',
        summary: 'Các kỹ năng về AI, ML đang trở thành must-have trong ngành công nghệ.',
        content: 'Với sự phát triển nhanh chóng của AI, các công ty đang tìm kiếm nhân tài có kỹ năng...',
        link: '/news/ai-ml-skills-demand',
        imageUrl: '/images/ai-ml.jpg',
        date: '2024-01-05',
        author: 'TOREDCO Admin',
        createdAt: new Date('2024-01-05').toISOString(),
        updatedAt: new Date('2024-01-05').toISOString()
      }
    ];

    // Filter by search if provided
    let filteredNews = sampleNews;
    if (search) {
      filteredNews = sampleNews.filter(news => 
        news.title.toLowerCase().includes(search.toLowerCase()) ||
        news.summary.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedNews = filteredNews.slice(startIndex, startIndex + limitNum);

    console.log('✅ [ADMIN NEWS] Returning news:', paginatedNews.length);
    
    return NextResponse.json({ 
      success: true, 
      data: paginatedNews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredNews.length,
        totalPages: Math.ceil(filteredNews.length / limitNum)
      }
    });
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
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.summary || !body.link) {
      return NextResponse.json(
        { success: false, message: 'Title, summary, and link are required' },
        { status: 400 }
      );
    }

    // Tạo news mới
    const newsData = {
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      imageUrl: body.imageUrl || '/images/default-news.jpg'
    };

    const response = await apiClient.news.create(newsData);
    
    return NextResponse.json(
      { success: true, data: response.data, message: 'News created successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating news:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

