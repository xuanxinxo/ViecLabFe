"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from '@tanstack/react-query';

// Cache time in milliseconds (5 minutes)
const CACHE_TIME = 5 * 60 * 1000;

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline?: string;
  status: string;
  postedDate: string;
  img: string | null;
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 text-xl hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          Ứng tuyển: {job?.title}
        </h3>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <input name="name" placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" placeholder="Email" className="border p-2 rounded" required type="email" />
          <input name="phone" placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" placeholder="Link CV (nếu có)" className="border p-2 rounded" />
          <textarea name="message" placeholder="Tin nhắn" className="border p-2 rounded" rows={4} />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-semibold hover:shadow-lg transition-all"
          >
            Gửi ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

interface JobsApiResponse {
  jobs: Job[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

// Custom hook for fetching jobs with React Query
function useJobsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ['jobs', 'external', page, limit],
    queryFn: async (): Promise<JobsApiResponse> => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://https://vieclabbe.onrender.com';
        const res = await fetch(`${backendUrl}/api/jobs?page=${page}&limit=${limit}`);
        
        if (!res.ok) {
          throw new Error('Không thể tải danh sách công việc');
        }
        
        const data = await res.json();
        
        // Transform the response to match the expected format
        const allJobs = Array.isArray(data) ? data : (data.data || []);
        const total = allJobs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedJobs = allJobs.slice(startIndex, endIndex);
        
        return {
          jobs: paginatedJobs,
          pagination: {
            total,
            totalPages,
            page,
            limit,
          }
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
    placeholderData: (previousData) => previousData,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Skeleton loader component
function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 animate-pulse">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function AllJobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 6,
    total: 0,
    totalPages: 1,
  });

  const [applyModal, setApplyModal] = useState<{ open: boolean; job: any }>({
    open: false,
    job: null,
  });

  // Use React Query for data fetching with caching
  const { data, isLoading, isError, error, refetch } = useJobsQuery(pagination.page, pagination.limit);
  
  // Safely access data with fallbacks
  const jobs = data?.jobs ?? [];
  const paginationData = {
    total: data?.pagination?.total ?? 0,
    totalPages: data?.pagination?.totalPages ?? (Math.ceil((data?.pagination?.total ?? 0) / pagination.limit) || 1),
    page: data?.pagination?.page ?? pagination.page,
    limit: data?.pagination?.limit ?? pagination.limit
  };
  
  // Update URL when pagination changes
  const updateURL = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
    updateURL(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateURL, paginationData.totalPages]);

  // Update pagination when data is loaded
  useEffect(() => {
    if (data?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    }
  }, [data?.pagination]);

  const handleApply = (job: Job) => {
    setApplyModal({ open: true, job });
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = {
      name: (form.name as any).value,
      email: (form.email as any).value,
      phone: (form.phone as any).value,
      cv: (form.cv as any).value,
      message: (form.message as any).value,
      jobId: applyModal.job.id,
    };
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const responseData = await res.json();
    console.log('Application response:', responseData);
    
    // Handle nested response structure
    const isSuccess = responseData.success && (responseData.data?.success !== false);
    if (isSuccess) {
      alert("Ứng tuyển thành công!");
      setApplyModal({ open: false, job: null });
    } else {
      alert("Ứng tuyển thất bại!");
    }
  };

  // Show loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Đang tải công việc...</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h1>
          <p className="text-gray-700 mb-6">Không thể tải danh sách công việc. Vui lòng thử lại sau.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Danh sách việc làm nổi bật
            </h1>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Hiển thị <span className="font-semibold text-blue-600">{jobs.length}</span> trong tổng số{' '}
              <span className="font-semibold text-blue-600">{pagination.total}</span> việc làm
            </p>
            <div className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
          </div>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Không có việc làm nào</h2>
              <p className="text-gray-500 mb-6">Hiện tại chưa có việc làm nào được đăng</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Job Image */}
                {job.img && (
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <img
                      src={job.img}
                      alt={job.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Job Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-1">{job.company}</p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Hot
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                      {job.type}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {job.salary || 'Thỏa thuận'}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Posted Date */}
                  <div className="text-xs text-gray-400 mb-4">
                    Đăng ngày: {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApply(job)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ứng tuyển ngay
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={pagination.page <= 1}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Trước
              </button>
              <span className="text-gray-700 font-medium">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Xem thêm button */}
        {pagination.page < pagination.totalPages && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Xem thêm việc làm →
            </button>
          </div>
        )}

        {/* Application Modal */}
        {applyModal.open && applyModal.job && (
          <ApplyModal
            open={applyModal.open}
            onClose={() => setApplyModal({ open: false, job: null })}
            onSubmit={handleApplySubmit}
            job={applyModal.job}
          />
        )}
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<div>Đang tải việc làm...</div>}>
      <AllJobsPageContent />
    </Suspense>
  );
}