'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '../../types/job';
import { apiLoaders } from '../../lib/apiDataLoader';

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải danh sách việc làm...</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Không thể tải danh sách việc làm</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={onRetry} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Thử lại</button>
              <Link href="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">Về trang chủ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsHeader({ total }: { total: number }) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tất cả việc làm</h1>
            <p className="text-gray-600 mt-1">Tìm thấy {total} việc làm phù hợp</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 ease-in-out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchFilters(props: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}) {
  const { searchTerm, setSearchTerm, locationFilter, setLocationFilter, typeFilter, setTypeFilter, onSearch, onClear } = props;
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <form onSubmit={onSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập từ khóa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả địa điểm</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Hải Phòng">Hải Phòng</option>
            </select>
          </div>
          <div>
            <label className="block text.sm font-medium text-gray-700 mb-2">Loại hình</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại hình</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Tìm kiếm</button>
            <button type="button" onClick={onClear} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Xóa</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
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
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
            <p className="text-blue-600 font-medium">{job.company}</p>
          </div>
          {job.img && (
            <img
              src={job.img}
              alt={`${job.company} logo`}
              className="w-12 h-12 object-contain rounded ml-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">📍 {job.location}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">💼 {job.type}</span>
          {job.salary && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">💰 {job.salary}</span>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{job.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{new Date(job.postedDate).toLocaleDateString('vi-VN')}</span>
          <Link href={`/jobnew/${job.id}`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Xem chi tiết</Link>
        </div>
      </div>
    </div>
  );
}

function PaginationControls({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (newPage: number) => void; }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center space-x-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Trước</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
          if (pageNum > totalPages) return null as any;
          return (
            <button key={pageNum} onClick={() => onChange(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === page ? 'text-white bg-blue-600 border border-blue-600' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sau</button>
      </nav>
    </div>
  );
}

export default function AllJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, [pagination.page, searchTerm, locationFilter, typeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(locationFilter && { location: locationFilter }),
        ...(typeFilter && { type: typeFilter }),
      };

      console.log('Loading jobs with params:', params);

      const result = await apiLoaders.jobs.load(params);

      if (result.success) {
        setJobs(result.data as Job[]);
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: result.pagination?.totalPages || Math.ceil(result.total / pagination.limit),
        }));
        console.log(`✅ Loaded ${result.data.length} jobs successfully`);
      } else {
        throw new Error(result.error || 'Failed to load jobs');
      }
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && jobs.length === 0) {
    return <LoadingState />;
  }

  if (error && jobs.length === 0) {
    return <ErrorState message={error} onRetry={loadJobs} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <JobsHeader total={pagination.total} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onSearch={handleSearch}
          onClear={clearFilters}
        />

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy việc làm</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm || locationFilter || typeFilter 
                  ? 'Không có việc làm nào phù hợp với bộ lọc của bạn'
                  : 'Hiện tại chưa có việc làm nào được đăng'
                }
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-blue-600 font-medium">{job.company}</p>
                    </div>
                    {job.img && (
                      <img
                        src={job.img}
                        alt={`${job.company} logo`}
                        className="w-12 h-12 object-contain rounded ml-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📍 {job.location}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      💼 {job.type}
                    </span>
                    {job.salary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        💰 {job.salary}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                    </span>
                     <Link
                       href={`/jobnew/${job.id}`}
                       className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       Xem chi tiết
                     </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <PaginationControls page={pagination.page} totalPages={pagination.totalPages} onChange={handlePageChange} />
      </div>
    </div>
  );
}
