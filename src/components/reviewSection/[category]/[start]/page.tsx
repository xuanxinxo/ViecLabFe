// app/reviews/[category]/[star]/page.tsx
import { notFound } from 'next/navigation';

type Params = { category: 'talent' | 'company'; star: string };

type Review = {
  id: number;
  category: 'talent' | 'company';
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar?: string;
  dob?: string;
  experience?: number;
  hometown?: string;
};

export default async function Page({ params }: { params: Params }) {
  const star = Number(params.star);
  if (![1, 2, 3, 4, 5].includes(star)) return notFound();

  /* fetch API */
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reviews`, { next: { revalidate: 60 } });
  const { data } = (await res.json()) as { data: Review[] };

  const list = data.filter((r) => r.category === params.category && r.rating === star);

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-8">
          {params.category === 'talent' ? 'Nhân sự' : 'Doanh nghiệp'} hạng {star} sao
        </h1>

        {list.length === 0 ? (
          <p className="text-gray-500">Chưa có dữ liệu.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((r, idx) => (
              /* card giống hệt component chính – có thể tách thành <Card/> dùng chung */
              <article
                key={r.id}
                className={`group relative border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 overflow-hidden ${
                  ['bg-gradient-to-br from-red-400    to-red-600',
                   'bg-gradient-to-br from-blue-400   to-blue-600',
                   'bg-gradient-to-br from-green-400  to-green-600',
                   'bg-gradient-to-br from-orange-400 to-orange-600',
                   'bg-gradient-to-br from-yellow-400 to-yellow-600'][star - 1]
                }`}
              >
                {/* ... (avatar, name, info) giống Card ở trên) ... */}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
