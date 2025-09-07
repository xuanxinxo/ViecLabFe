import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const application = await prisma.application.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { success: false, message: "Không thể xóa ứng viên" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        hiring: true,
      },
    });
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy ứng viên" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    console.error("Error fetching application:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
} 