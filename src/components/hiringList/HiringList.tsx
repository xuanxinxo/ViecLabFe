'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedApplications, Application } from '@/lib/api/applications';
import HiringFilter from '../HiringFilter';

// Application interface is now imported from the API service

export function HiringList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(8); // Show first 8 applications

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('[HiringList] Fetching applications...');
        const data = await getFeaturedApplications(8);
        console.log(`[HiringList] Received ${data.length} applications`);
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[HiringList] Error loading applications:', errorMessage, err);
        setError(`Không tải được danh sách ứng viên: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    console.log('[HiringList] Component mounted, starting data fetch');
    fetchApplications();
    
    // Clean up function
    return () => {
      console.log('[HiringList] Component unmounted');
    };
  }, []);

  useEffect(() => {
    if (applications.length > 0) {
      console.log('Applications loaded:', applications);
    }
  }, [applications]);

  if (loading) return <div className="text-center py-20 text-lg">Đang tải...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-600 text-lg mb-4">Không có dữ liệu ứng viên nào được tìm thấy.</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        {/* Tiêu đề */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3">Danh sách ứng viên</h2>
          <p className="text-gray-600 text-lg">Hồ sơ ứng viên mới nhất</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.slice(0, visibleCount).map((application) => {
            const job = application.job || application.hiring;
            if (!job) return null;
            return (
              <div
                key={application._id}
                className="relative bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{application.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">📧 {application.email}</p>
                      {application.phone && (
                        <p className="text-sm text-gray-600 mb-3">
                          📞 {application.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      application.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : application.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {application.status === 'pending' ? 'Đang chờ' : application.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-white rounded-lg border border-gray-100">
                    <h5 className="font-semibold text-gray-800 mb-1">{job.title}</h5>
                    <p className="text-sm text-gray-600">🏢 {job.company}</p>
                    {job.location && (
                      <p className="text-sm text-gray-600">📍 {job.location}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.type && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          💰 {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {application.message && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-1">Lời nhắn:</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {application.message.length > 100 
                          ? `${application.message.substring(0, 100)}...` 
                          : application.message}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      📅 {new Date(application.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {application.cv && (
                      <a
                        href={application.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        <span className="mr-1">📄</span> Xem CV
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
        <div className="text-center mt-12">
          <Link
            href="/#"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Xem tất cả các ứng viên tại đây nhé
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Bộ lọc */}
        <div className="mt-16">
          <HiringFilter />
        </div>
      </div>
    </section>
  );
}
