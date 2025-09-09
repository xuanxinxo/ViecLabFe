'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Review {
  id: number;
  category: 'talent' | 'company';
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar?: string;
  title?: string;
  content?: string;
  experience?: number;
  hometown?: string;
  createdAt?: string;
}

export default function SimpleAdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setReviews(data.data);
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesCategory = filter === 'all' || review.category === filter;
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesCategory && matchesRating;
  });

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return 'text-red-500';
      case 4: return 'text-blue-500';
      case 3: return 'text-green-500';
      case 2: return 'text-orange-500';
      case 1: return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRatingBg = (rating: number) => {
    switch (rating) {
      case 5: return 'bg-gradient-to-br from-red-400 to-red-600';
      case 4: return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 3: return 'bg-gradient-to-br from-green-400 to-green-600';
      case 2: return 'bg-gradient-to-br from-orange-400 to-orange-600';
      case 1: return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? getRatingColor(rating) : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Đang tải danh sách đánh giá...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin/simple" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Tổng: {reviews.length} đánh giá</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadReviews}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại đánh giá
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="talent">Nhân sự</option>
                <option value="company">Doanh nghiệp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xếp hạng
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Danh sách đánh giá ({filteredReviews.length})
            </h2>
          </div>
          
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đánh giá</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter !== 'all' || ratingFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc'
                  : 'Chưa có đánh giá nào'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full ${getRatingBg(review.rating)} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">★</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{review.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              review.category === 'talent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {review.category === 'talent' ? 'Nhân sự' : 'Doanh nghiệp'}
                            </span>
                          </div>
                          
                          {review.title && (
                            <p className="text-sm font-medium text-gray-600 mb-2">{review.title}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                            </div>
                            
                            {review.experience && (
                              <div className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {review.experience} năm kinh nghiệm
                              </div>
                            )}
                            
                            {review.hometown && (
                              <div className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {review.hometown}
                              </div>
                            )}
                          </div>
                          
                          {review.content && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                              {review.content}
                            </p>
                          )}
                          
                          {review.createdAt && (
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


