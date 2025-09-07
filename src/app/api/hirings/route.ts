import { NextResponse } from 'next/server';

// GET /api/hirings - lấy danh sách tuyển dụng
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'approved';

    // Call backend API directly to get hiring data from MongoDB
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/hirings?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const hiringData = await response.json();
    return NextResponse.json(hiringData);
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
