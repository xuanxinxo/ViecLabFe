import { NextRequest, NextResponse } from 'next/server';

// PUT: Cập nhật tin tức
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
      console.error('Invalid news ID:', params.id);
      return NextResponse.json(
        { error: 'ID tin tức không hợp lệ' },
        { status: 400 }
      );
    }
    
    const contentType = request.headers.get('content-type') || '';
    let title, summary, date, link, imageUrl;

    if (contentType.includes('multipart/form-data')) {
      console.log('Processing FormData (with image)');
      
      // Create a new FormData from the request body
      const formData = await request.formData();
      
      // Get text fields from form data
      title = formData.get('title')?.toString() || '';
      summary = formData.get('summary')?.toString() || '';
      date = formData.get('date')?.toString() || '';
      link = formData.get('link')?.toString() || '';
      
      console.log('Form data received:', { title, summary, date, link });
      
      // Get the image file from form data
      const imageFile = formData.get('image');
      console.log('Image file received:', imageFile ? 'Yes' : 'No');
      
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        console.log('Processing image file:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        
        // Mock image URL
        imageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop';
        console.log('✅ Mock image URL assigned:', imageUrl);
      } else {
        console.log('No image file provided or file is empty');
      }
    } else {
      console.log('Processing JSON (text only)');
      // Xử lý JSON (chỉ text)
      const body = await request.json();
      title = body.title;
      summary = body.summary;
      date = body.date;
      link = body.link;
      console.log('JSON data received:', { title, summary, date, link });
    }

    if (!title || !summary || !date) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
    }

    // Mock update news item
    const updatedNews = {
      _id: params.id,
      title: title.trim(),
      summary: summary.trim(),
      date: date,
      link: link ? link.trim() : '',
      image: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      news: updatedNews,
      message: 'Cập nhật tin tức thành công'
    });

  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// GET: Lấy chi tiết tin tức theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [NEWS ID API] GET request for ID:', params.id);
    
    // Proxy to backend
    const backendUrl = 'https://vieclabbe.onrender.com';
    const backendApiUrl = `${backendUrl}/api/news/${params.id}`;
    
    console.log(`Calling backend API: ${backendApiUrl}`);

    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    // For single item, return the data directly
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
