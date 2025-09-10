"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "../lib/api";
// Helper function to extract data array from API response
const extractDataArray = (responseData: any) => {
  if (responseData.success && responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
    // Handle format: { success: true, data: { items: [...], pagination: {...} } }
    return responseData.data.items;
  } else if (responseData.success && Array.isArray(responseData.data)) {
    // Handle format: { success: true, data: [...] }
    return responseData.data;
  } else if (Array.isArray(responseData.data)) {
    return responseData.data;
  } else if (Array.isArray(responseData)) {
    return responseData;
  }
  return [];
};

interface NewsItem {
  id?: string;
  _id?: string;
  title: string;
  summary?: string;
  image?: string;
  link?: string;
  date?: string;
  createdAt?: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching news...");
        const responseData = await apiClient.news.getAll({});
        const newsData = extractDataArray(responseData);
        console.log("Fetched news data:", newsData);

        if (!newsData || !Array.isArray(newsData)) {
          throw new Error("Invalid data format received");
        }

        const validNews = newsData.filter(
          (item) => item && (item._id || item.id) && item.title
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
  }, []); // Only fetch once when component mounts

  if (loading)
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tin Tức</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">
            Xem thêm →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          Đang tải tin tức...
        </div>
      </div>
    );
    
  if (error)
    return (
      <div className="p-4 bg-white rounded shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tin Tức</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">
            Xem thêm →
          </Link>
        </div>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );

  if (news.length === 0) {
    return (
      <section className="p-4 bg-white rounded shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tin Tức</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">
            Xem thêm →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          Không có tin tức nào để hiển thị
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 bg-white rounded shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tin Tức</h2>
        <Link href="/news" className="text-sm text-blue-600 hover:underline">
          Xem thêm →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {news.map((item) => (
          <div
            key={item.id || item._id}
            className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-200"
          >
            <Link href={item.link || `/news/${item.id || item._id}`} className="block" target={item.link ? "_blank" : "_self"}>
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
                <p className="text-xs text-gray-600 mt-1">
                  {item.date ? new Date(item.date).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}