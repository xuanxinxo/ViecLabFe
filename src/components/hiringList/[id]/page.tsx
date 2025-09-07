// import { prisma } from '@/lib/prisma';
import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export default async function HiringDetail({ params }: { params: { id: string } }) {
  const hiring = await prisma.hiring.findUnique({ where: { id: params.id } });
  if (!hiring) return <p className="p-10">Tin không tồn tại</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/hiring" className="text-blue-600">&larr; Quay lại</Link>
      <h1 className="text-3xl font-bold mt-4">{hiring.title}</h1>
      <p className="text-gray-600 mb-4">{hiring.company} – {hiring.location}</p>
      {/* …render đầy đủ description, requirements, benefits… */}
    </div>
  );
}
