'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import ClientOnly from '../ui/ClientOnly';
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
import HiringFilter from '../HiringFilter';

interface Application {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  cv?: string;
  jobId?: string;
  hiringId?: string;
  createdAt?: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    type?: string;
  };
}

export function HiringList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(4); // Show first 4 applications

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('[HiringList] Fetching applications...');
        const responseData = await apiClient.applications.getAll({});
        const applicationsData = extractDataArray(responseData);
        console.log(`[HiringList] Received ${applicationsData.length} applications`);
        setApplications(Array.isArray(applicationsData) ? applicationsData.slice(0, 4) : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[HiringList] Error loading applications:', errorMessage);
        setError(`Không tải được danh sách ứng viên: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // Only run once when component mounts

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
            return (
              <div
                key={application.id || application._id}
                className="relative bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{application.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">📧 {application.email}</p>
                      <p className="text-sm text-gray-600 mb-1">📞 {application.phone}</p>
                      {application.job && (
                        <p className="text-sm text-gray-600 mb-3">
                          🏢 {application.job.company}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Ứng viên
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-white rounded-lg border border-gray-100">
                    <h5 className="font-semibold text-gray-800 mb-1">Vị trí ứng tuyển</h5>
                    {application.job ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-blue-600 mb-1">{application.job.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {application.job.type && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {application.job.type}
                            </span>
                          )}
                          {application.job.salary && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              💰 {application.job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Không có thông tin việc làm</p>
                    )}
                  </div>

                  {application.message && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Tin nhắn:</h6>
                      <p className="text-xs text-gray-600 line-clamp-2">{application.message}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      📅 <ClientOnly fallback="Loading...">
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </ClientOnly>
                    </span>
                    <Link
                      href={`/jobnew/${application.jobId || application.job?.id}`}
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <span className="mr-1">👁️</span> Xem chi tiết
                    </Link>
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
