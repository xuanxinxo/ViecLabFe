'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
interface Job {
  _id: string;
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
  img?: string;
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative transform transition-all">
        <button
          className="absolute top-4 right-4 text-gray-400 text-2xl hover:text-red-500 transition-colors"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-6">Ứng tuyển: {job?.title}</h3>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <input 
            name="name" 
            placeholder="Họ tên" 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            required 
            type="email" 
          />
          <input 
            name="phone" 
            placeholder="Số điện thoại" 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            required 
          />
          <input 
            name="cv" 
            placeholder="Link CV (nếu có)" 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
          />
          <textarea 
            name="message" 
            placeholder="Tin nhắn" 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
            rows={4} 
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Gửi ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AllJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [applyModal, setApplyModal] = useState<{ open: boolean; job: any }>({ open: false, job: null });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await fetch('/api/newjobs');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('API Response:', data);
        
        // Fix: API returns data.data, not data.jobs
        setJobs(data.data || []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleApply = (job: any) => {
    setApplyModal({ open: true, job });
  };

  const handleApplySubmit = async (e: any) => {
    e.preventDefault();
    setApplyLoading(true);
    const form = e.target;
    const formData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      cv: form.cv.value,
      message: form.message.value,
      jobId: applyModal.job._id,
      hiringId: undefined,
    };
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setApplyLoading(false);
    const responseData = await res.json();
    console.log('Application response:', responseData);
    
    // Handle nested response structure
    const isSuccess = responseData.success && (responseData.data?.success !== false);
    if (isSuccess) {
      alert('Ứng tuyển thành công!');
      setApplyModal({ open: false, job: null });
    } else {
      alert('Ứng tuyển thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Đang tải việc làm...</h1>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
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
              Việc làm mới nhất
            </h1>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Hiển thị <span className="font-semibold text-blue-600">{jobs.length}</span> trong tổng số{' '}
              <span className="font-semibold text-blue-600">{pagination.total || jobs.length}</span> việc làm
            </p>
            <div className="text-sm text-gray-500">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Job List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Không có việc làm nào</h2>
            <p className="text-gray-500 mb-6">Hiện tại chưa có việc làm mới nào được đăng</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
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
                        Mới
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={pagination.page <= 1}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Trước
              </button>
              <span className="text-gray-700 font-medium">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={applyModal.open}
        onClose={() => setApplyModal({ open: false, job: null })}
        onSubmit={handleApplySubmit}
        job={applyModal.job}
      />
    </div>
  );
}
