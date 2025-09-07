import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
// GET: Lấy danh sách Job mới nhất (không phải NewJob)
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { postedDate: 'desc' },
      take: 5,
      where: { status: 'active' }
    });
    return NextResponse.json({ data: jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Không hỗ trợ tạo Job ở route này
export async function POST() {
  return NextResponse.json({ success: false, message: 'Not supported' }, { status: 405 });
} 