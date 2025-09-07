'use client';

import React from 'react';

export default function Marquee() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 p-4">
      {/* Marquee Text */}
      <div className="w-full overflow-hidden">
        <p className="whitespace-nowrap animate-marquee text-2xl font-bold bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent">
          🚀 Tới Công Chuyện - Tìm việc dễ dàng, ứng tuyển chỉ với 1 cú click! &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
          💼 Nền Tảng Kết Nối Minh Bạch &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
          📌 Việc làm mơ ước không còn xa – Khám phá ngay!
        </p>
      </div>
    </div>
  );
}
