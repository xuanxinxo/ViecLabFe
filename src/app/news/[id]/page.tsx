import { notFound } from 'next/navigation'
import { apiClient } from '../../../lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ObjectId } from 'mongodb'

type Props = { params: { id: string } }

// Validate if the ID is a valid MongoDB ObjectId
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export default async function NewsDetailPage({ params }: Props) {
  // Check if the ID is a valid MongoDB ObjectId
  if (!isValidObjectId(params.id)) {
    console.error(`[NEWS] Invalid news ID format: ${params.id}`);
    notFound();
  }

  try {
    console.log(`[NEWS] Fetching news details for ID: ${params.id}`);
    
    // Fetch news details directly from the API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/news/${params.id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[NEWS] Failed to fetch news: ${response.status} ${response.statusText}`);
      notFound();
    }

    const data = await response.json();
    const newsItem = data.news || data.data || data;

    if (!newsItem) {
      console.error('[NEWS] News item not found');
      notFound();
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
      notFound();
    }

    const { title, summary, date, image, content } = normalizedItem;

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
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
    )
  } catch (error) {
    console.error('Error fetching news item:', error)
    notFound()
  }
}
