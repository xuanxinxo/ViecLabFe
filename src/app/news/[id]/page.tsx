'use client';

import { notFound } from 'next/navigation'
import { apiClient } from '../../../lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ObjectId } from 'mongodb'
import { apiLoaders } from '../../../lib/apiDataLoader'
import { useState, useEffect } from 'react'

type Props = { params: { id: string } }

// Validate if the ID is a valid MongoDB ObjectId
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export default function NewsDetailPage({ params }: Props) {
  const [newsItem, setNewsItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        // Check if the ID is a valid MongoDB ObjectId
        if (!isValidObjectId(params.id)) {
          console.error(`[NEWS] Invalid news ID format: ${params.id}`);
          setError('Invalid news ID format');
          return;
        }

        console.log(`[NEWS] Fetching news details for ID: ${params.id}`);
        
        // Fetch news details using API loader
        const result = await apiLoaders.news.loadItem(params.id);

        if (!result.success || !result.data) {
          console.error(`[NEWS] Failed to fetch news: ${result.error}`);
          setError(result.error || 'Failed to load news');
          return;
        }

        setNewsItem(result.data);
      } catch (err) {
        console.error('Error loading news:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">
        <span className="text-lg font-medium animate-pulse">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center">
        <div className="max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy tin tức</h2>
          {error && (
            <p className="text-gray-600 mb-4 text-sm">
              Lỗi: {error}
            </p>
          )}
          <p className="text-gray-500 mb-6 text-sm">
            ID: {params.id}
          </p>
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 ease-in-out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  // Normalize the news item data
  const normalizedItem = {
    id: newsItem._id || newsItem.id || params.id,
    title: newsItem.title || 'Không có tiêu đề',
    summary: newsItem.summary || newsItem.content || '',
    content: newsItem.content || newsItem.summary || '',
    date: newsItem.date || new Date().toISOString(),
    image: newsItem.image || '/default-news.jpg',
    link: newsItem.link || ''
  };

  // Ensure we have all required fields
  if (!normalizedItem.title || !normalizedItem.content) {
    console.error('[NEWS] News item is missing required fields:', normalizedItem);
    setError('News item is missing required fields');
    return null;
  }

  const { title, summary, date, image, content } = normalizedItem;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-40">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <time className="text-gray-500 mb-4 block">
        {new Date(date).toLocaleDateString('vi-VN')}
      </time>
      {image && (
        <div className="relative w-full h-64 mb-6">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="rounded object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      )}
      <div className="prose max-w-none">
        <p className="text-lg mb-4">{summary}</p>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className="mt-6 space-y-4">
        <Link href="/news" className="inline-block text-blue-600 hover:underline">
          ← Quay lại danh sách tin tức
        </Link>
        <div>
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
