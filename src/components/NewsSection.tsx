"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedNews, NewsItem } from "../lib/api/news";

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching featured news...");
        const data = await getFeaturedNews(4, Date.now());
        console.log("Fetched news data:", data);

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }

        const validNews = data.filter(
          (item) => item && item._id && item.title
        ).slice(0, 4);

        setNews(validNews);
      } catch (err) {
        console.error("Error loading news:", err);
        setError("Không tải được tin tức. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []); // 👈 chỉ fetch 1 lần khi component mount

  if (loading)
    return (
      <div className="p-4 bg-white rounded shadow">Đang tải tin tức...</div>
    );
  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
    );

  if (news.length === 0) {
    return (
      <section className="p-4 bg-white rounded shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tin Tức</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">
            Xem thêm &rarr;
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          Không có tin tức nào để hiển thịsssssssssssssssss
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 bg-white rounded shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tin Tức</h2>
        <Link href="/news" className="text-sm text-blue-600 hover:underline">
          Xem thêm &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {news.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-200"
          >
            <Link href={`/news/${item._id}`} className="block">
              <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
                <Image
                  src={item.image || '/reparo-logo.png'}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
