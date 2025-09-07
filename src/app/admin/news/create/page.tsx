'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateNews() {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    link: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('link', formData.link);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Tạo tin tức thành công!' });
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      console.error('Error creating news:', error);
      setMessage({ type: 'error', text: 'Không thể kết nối đến server' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      setImageFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/news" className="text-blue-600 hover:text-blue-800">
                ← Quay lại quản lý tin tức
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Đăng tin tức mới</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề tin tức *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tiêu đề tin tức..."
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt nội dung *
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tóm tắt nội dung tin tức..."
                required
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đăng *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh (tùy chọn)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 5MB
              </p>
              {imageFile && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">✓ Đã chọn: {imageFile.name}</p>
                </div>
              )}
            </div>

            {/* Link */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                Link nguồn (tùy chọn)
              </label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/article"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link đến bài viết gốc (nếu có)
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Đang tạo...' : 'Tạo tin tức'}
              </button>
              <Link
                href="/admin/news"
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 text-center font-medium"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
