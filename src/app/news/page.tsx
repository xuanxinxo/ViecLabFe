import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  // Add other fields as needed
}

export const revalidate = 60;

async function getNews(): Promise<NewsItem[]> {
  try {
    console.log('[NEWS] Fetching news data from http://localhost:5000/api/news...');
    const response = await fetch('http://localhost:5000/api/news', {
      cache: 'no-store', // Ensure fresh data on each request
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let newsItems: NewsItem[] = [];
    
    if (data.news && Array.isArray(data.news)) {
      // Format: { news: [...] }
      newsItems = data.news;
    } else if (Array.isArray(data)) {
      // Format: [...]
      newsItems = data;
    } else if (data.data) {
      // Format: { data: [...] }
      newsItems = Array.isArray(data.data) ? data.data : [];
    }
    
    console.log(`[NEWS] Fetched ${newsItems.length} news items`);
    
    // Transform and validate news items
    return newsItems.map((item: any) => ({
      id: item._id?.toString() || item.id?.toString() || Math.random().toString(36).substring(2, 9),
      title: item.title || item.headline || 'Không có tiêu đề',
      content: item.content || item.summary || item.description || '',
      image: item.imageUrl || item.image || item.thumbnail || '/default-news.jpg',
      date: item.date || item.publishedAt || item.createdAt || new Date().toISOString(),
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first
    
  } catch (error) {
    console.error('[NEWS] Error fetching news:', error);
    // Return empty array instead of failing the page
    return [];
  }
}

export default async function NewsListPage() {
  const news = await getNews();

  return (
    <div className="max-w-7xl mx-auto p-6 mt-20">
      <div className="flex items-center justify-between mb-6 mt-10">
        <h1 className="text-3xl font-bold">Tin tức</h1>
        <Link href="/" className="text-blue-600 hover:underline">Trang chủ</Link>
      </div>

      {news && news.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {news.map((item: NewsItem) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <div className="relative w-full h-44 rounded-t-lg overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                {item.date ? (
                  <time className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </time>
                ) : (
                  <span className="text-xs text-gray-400">Không có ngày</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Không có tin tức nào</p>
      )}
    </div>
  );
}
