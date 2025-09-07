'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReviews, Review } from '../../lib/api/reviews';

const RANKS = [5, 4, 3, 2, 1] as const;

/* ========= bảng màu GIỮ NGUYÊN ========= */
const getStarColor = (s: number) =>
  ['text-red-500', 'text-blue-500', 'text-green-500', 'text-orange-500', 'text-yellow-500'][s - 1];
const getStarBg = (s: number) =>
  [
    'bg-gradient-to-br from-red-400    to-red-600',
    'bg-gradient-to-br from-blue-400   to-blue-600',
    'bg-gradient-to-br from-green-400  to-green-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
  ][s - 1];

export default function ReviewRankingTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getReviews({
          limit: 100, // Lấy đủ lớn để filter phía client
          status: 'approved'
        });
        
        setReviews(response.data);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Không thể tải dữ liệu đánh giá');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  /* Lấy toán bộ list – cắt xuống 3 khi hiển thị */
  const getList = (cat: Review['category'], star: number) =>
    reviews.filter((r) => r.category === cat && r.rating === star);

  const pad = (arr: Review[]) => {
    const clone = [...arr];
    while (clone.length < 3)
      clone.push({
        id: Date.now() + clone.length,
        name: '',
        category: 'talent',
        rating: 3,
      } as Review);
    return clone;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---- heading giữ nguyên ---- */}
        <div className="text-left mb-12 bg-black bg-opacity-10 p-6 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Bảng Xếp Hạng Sao
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Khám phá những nhân tài và doanh nghiệp xuất sắc nhất được đánh giá bởi cộng đồng
          </p>
        </div>

        {/* ---- table giữ nguyên ---- */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-center border-collapse">  
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                <th className="py-6 text-xl font-bold text-white border-r border-white/20">
                  <div className="flex items-center justify-center gap-2">👥 NHÂN SỰ</div>
                </th>
                <th className="py-6 text-xl font-bold text-white">
                  <div className="flex items-center justify-center gap-2">🏢 DOANH NGHIỆP</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {RANKS.map((star, rowIdx) => {
                const talents = getList('talent', star);
                const companies = getList('company', star);

                const showTalents = pad(talents.slice(0, 3));
                const showCompanies = pad(companies.slice(0, 3));

                const moreTalent = talents.length > 3;
                const moreCompany = companies.length > 3;

                return (
                  <tr
                    key={star}
                    className={`${rowIdx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/50 transition-colors duration-300`}
                  >
                    {/* ===== column TALENT ===== */}
                    <td className="p-6 align-top border-r border-gray-200">
                      <ColumnHeader star={star} label="Top performers" />

                      <CardGrid list={showTalents} star={star} />

                      {moreTalent && (
                        <Link
                          href={`/reviews/talent/${star}`}
                          className="block mt-4 text-sm font-medium text-blue-600 hover:underline"
                        >
                          Xem thêm &raquo;
                        </Link>
                      )}
                    </td>

                    {/* ===== column COMPANY ===== */}
                    <td className="p-6 align-top">
                      <ColumnHeader star={star} label="Top companies" />

                      <CardGrid list={showCompanies} star={star} />

                      {moreCompany && (
                        <Link
                          href={`/reviews/company/${star}`}
                          className="block mt-4 text-sm font-medium text-blue-600 hover:underline"
                        >
                          Xem thêm &raquo;
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* giữ animation cũ */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ---------- sub‑components (UI Y NGUYÊN) ---------- */
function ColumnHeader({ star, label }: { star: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-12 h-12 rounded-full ${getStarBg(star)} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-lg">★</span>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800">Xếp hạng {star} sao</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function CardGrid({ list, star }: { list: Review[]; star: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {list.map((r, idx) =>
        r.name ? (
          <Card key={r.id} r={r} star={star} idx={idx} />
        ) : (
          <EmptyCard key={idx} />
        )
      )}
    </div>
  );
}

function Card({ r, star, idx }: { r: Review; star: number; idx: number }) {
  return (
    <div
      className={`group relative border border-gray-200 rounded-xl p-4 text-left shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 overflow-hidden ${getStarBg(star)}`}
      style={{ animationDelay: `${idx * 100}ms`, animation: 'fadeInUp 0.6s ease-out forwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={r.avatar || '/img/ava.jpg'}
              alt={r.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{r.name}</h4>
            <div className="flex items-center gap-1">
              {Array.from({ length: star }).map((_, i) => (
                <span key={i} className={`text-sm ${getStarColor(star)}`}>★</span>
              ))}
            </div>
          </div>
        </div>

        {r.category === 'talent' && (
          <div className="space-y-2">
            <InfoRow icon="📅" text={r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'} />
            <InfoRow icon="💼" text={`${r.experience || 0} năm kinh nghiệm`} />
            <InfoRow icon="📍" text={r.hometown || 'Chưa cập nhật'} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-sm text-gray-400 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-2xl mb-2">📝</div>
        <div>Đang trống</div>
      </div>
    </div>
  );
}
