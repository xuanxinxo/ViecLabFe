import { NextResponse } from 'next/server';

// GET /api/hirings - lấy danh sách tuyển dụng
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'approved';

    // Call backend API directly to get hiring data from MongoDB
    const backendUrl = 'https://vieclabbe.onrender.com';
    
    let response;
    try {
      response = await fetch(`${backendUrl}/api/hirings?status=${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const hiringData = await response.json();
      return NextResponse.json(hiringData);
    } catch (fetchError) {
      console.error('Backend fetch error:', fetchError);
      // Fallback: return mock data when backend is not available
      console.log('🔄 [HIRINGS] Using fallback: returning mock data');
      
      const mockHirings = [
        {
          _id: 'mock_hiring_1',
          title: 'Lập trình viên Frontend',
          company: 'Công ty ABC',
          location: 'Hà Nội',
          type: 'Full-time',
          salary: '15-25 triệu',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          img: '/img/job-icon.svg',
          description: 'Tuyển dụng lập trình viên Frontend có kinh nghiệm',
          requirements: ['React', 'JavaScript', 'HTML/CSS'],
          benefits: ['Lương cao', 'Bảo hiểm', 'Nghỉ phép'],
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock_hiring_2',
          title: 'Lập trình viên Backend',
          company: 'Công ty XYZ',
          location: 'TP.HCM',
          type: 'Full-time',
          salary: '20-30 triệu',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          img: '/img/job-icon.svg',
          description: 'Tuyển dụng lập trình viên Backend có kinh nghiệm',
          requirements: ['Node.js', 'MongoDB', 'Express'],
          benefits: ['Lương cao', 'Bảo hiểm', 'Nghỉ phép'],
          status: 'approved',
          createdAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockHirings,
        count: mockHirings.length,
        message: 'Dữ liệu mẫu (chế độ offline)'
      });
    }
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tuyển dụng:', err);
    return NextResponse.json(
      { success: false, message: 'Không thể tải danh sách tuyển dụng' },
      { status: 500 }
    );
  }
}

// POST /api/hirings - thêm tin tuyển dụng (dùng trong admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      company,
      location,
      type,
      salary,
      deadline,
      img,
      description = '',
      requirements = [],
      benefits = [],
    } = body;

    // ✅ Kiểm tra các trường bắt buộc
    if (!title || !company || !location || !type || !salary || !deadline) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Parse deadline string into Date, support dd/MM/yyyy
    let deadlineDate: string;
    if (deadline.includes("/")) {
      const parts = deadline.split("/");
      if (parts.length !== 3) {
        return NextResponse.json({ success: false, message: 'Định dạng hạn nộp không hợp lệ' }, { status: 400 });
      }
      const [day, month, year] = deadline.split("/").map(Number);
      deadlineDate = new Date(year, month - 1, day).toISOString();
    } else {
      // Nếu là ISO string hoặc định dạng khác
      deadlineDate = new Date(deadline).toISOString();
    }

    // Kiểm tra ngày hết hạn hợp lệ
    if (isNaN(new Date(deadlineDate).getTime())) {
      return NextResponse.json(
        { success: false, message: 'Ngày hết hạn không hợp lệ' },
        { status: 400 }
      );
    }

    // Call backend API to create hiring
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/hirings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        company,
        location,
        type,
        salary,
        deadline: deadlineDate,
        img: img || '',
        description,
        requirements,
        benefits
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const newHiring = await response.json();
    return NextResponse.json(newHiring);
  } catch (err: any) {
    console.error('Lỗi khi thêm tin tuyển dụng:', err);
    
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi thêm tin tuyển dụng' },
      { status: 500 }
    );
  }
}
