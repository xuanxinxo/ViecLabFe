import { NextRequest, NextResponse } from 'next/server';

// ✅ Helper thêm CORS headers
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// ✅ OPTIONS handler cho CORS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

// ✅ PUT: Cập nhật tin tức
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== UPDATE NEWS API CALLED ===');
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('News ID:', params.id);

    // Validate news ID
    if (!params.id || params.id === 'undefined') {
      return withCORS(
        NextResponse.json({ error: 'ID tin tức không hợp lệ' }, { status: 400 })
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let title, summary, date, link, imageUrl;

    if (contentType.includes('multipart/form-data')) {
      console.log('📌 Processing FormData (with image)');
      const formData = await request.formData();

      title = formData.get('title')?.toString() || '';
      summary = formData.get('summary')?.toString() || '';
      date = formData.get('date')?.toString() || '';
      link = formData.get('link')?.toString() || '';

      const imageFile = formData.get('image');
      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl =
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop';
      }
    } else {
      console.log('📌 Processing JSON (text only)');
      const body = await request.json();
      ({ title, summary, date, link } = body);
    }

    // Validate required fields
    if (!title || !summary || !date) {
      return withCORS(
        NextResponse.json({ error: 'Thiếu dữ liệu bắt buộc' }, { status: 400 })
      );
    }

    // Mock update result
    const updatedNews = {
      _id: params.id,
      title: title.trim(),
      summary: summary.trim(),
      date,
      link: link?.trim() || '',
      image:
        imageUrl ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return withCORS(
      NextResponse.json({
        success: true,
        news: updatedNews,
        message: 'Cập nhật tin tức thành công',
      })
    );
  } catch (error) {
    console.error('❌ Error updating news:', error);
    return withCORS(
      NextResponse.json({ error: 'Server error' }, { status: 500 })
    );
  }
}

// ✅ GET: Lấy chi tiết tin tức theo ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [NEWS ID API] GET request for ID:', params.id);

    const backendApiUrl = `https://vieclabbe.onrender.com/api/news/${params.id}`;
    console.log(`➡️ Calling backend API: ${backendApiUrl}`);

    const response = await fetch(backendApiUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Backend response data:', data);

    return withCORS(NextResponse.json(data));
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return withCORS(
      NextResponse.json({ error: 'Server error' }, { status: 500 })
    );
  }
}
