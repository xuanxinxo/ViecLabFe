'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api';

interface Job {
  id: string;
  _id?: string; // For MongoDB compatibility
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  status: string;
  postedDate: string;
  deadline: string;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean }>({ message: '', type: 'info', show: false });
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    // Load jobs without authentication check
    loadJobs();
  }, [filter, router]);

  // Check for refresh parameter from create page
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      loadJobs();
      // Remove the refresh parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('refresh');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  // Refresh jobs when page becomes visible (e.g., when returning from create page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadJobs();
      }
    };

    const handleFocus = () => {
      loadJobs();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      // Call backend jobs API
      const response = await adminApi.jobs.getAll();
      console.log("ress>>>", response);
      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to load jobs');
      }

      // Handle response format: { success: true, data: { items: [...], pagination: {...} } }
      let jobsData = [];
      if (data.data && data.data.items && Array.isArray(data.data.items)) {
        jobsData = data.data.items;
      } else if (data.data && Array.isArray(data.data)) {
        jobsData = data.data;
      } else if (Array.isArray(data)) {
        jobsData = data;
      } else {
        jobsData = [];
      }


      // Format jobs data
      const formattedJobs = jobsData.map((job: any) => ({
        id: job.id || job._id || '',
        _id: job._id || job.id || '',
        title: job.title || 'No Title',
        company: job.company || 'No Company',
        location: job.location || 'Remote',
        type: job.type || 'Full-time',
        salary: job.salary || 'Negotiable',
        status: job.status || 'pending',
        postedDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A',
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'
      }));

      console.log('✅ [ADMIN JOBS PAGE] Formatted jobs:', formattedJobs);
      setJobs(formattedJobs);

      if (formattedJobs.length === 0) {
        showToast('ℹ️ Không có việc làm nào được tìm thấy.', 'info');
      } else {
        showToast(`✅ Đã tải ${formattedJobs.length} việc làm thành công!`, 'success');
      }
    } catch (error) {
      console.error('💥 [ADMIN JOBS PAGE] Error loading jobs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách việc làm. Vui lòng thử lại sau.';
      setError(errorMessage);
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${jobId}`]: true }));
      console.log('🔄 [ADMIN JOBS PAGE] Updating job status:', { jobId, newStatus });

      // Use jobs API with authentication
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ADMIN JOBS PAGE] Status update error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        if (response.status === 401) {
          showToast('❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
          router.push('/admin/login');
          return;
        } else if (response.status === 403) {
          showToast('❌ Không có quyền cập nhật trạng thái việc làm này.', 'error');
          return;
        } else if (response.status === 404) {
          showToast('❌ Không tìm thấy việc làm để cập nhật.', 'error');
          return;
        } else {
          showToast(`❌ Lỗi server: ${response.status} - ${response.statusText}`, 'error');
          return;
        }
      }

      const result = await response.json();

      if (result.success) {
        // Cập nhật trực tiếp danh sách thay vì load lại toàn bộ
        setJobs(prev =>
          prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job)
        );

        // Hiển thị thông báo thành công với toast đẹp hơn
        const statusText = newStatus === 'active' ? 'Đang hoạt động' :
          newStatus === 'pending' ? 'Chờ duyệt' :
            newStatus === 'expired' ? 'Hết hạn' : newStatus;

        // Tạo toast notification
        showToast(`✅ Đã cập nhật trạng thái việc làm thành "${statusText}"`, 'success');
      } else {
        showToast(`❌ ${result.message || 'Cập nhật trạng thái thất bại'}`, 'error');
      }
    } catch (error) {
      console.error('💥 [ADMIN JOBS PAGE] Error updating job status:', error);
      showToast('❌ Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${jobId}`]: false }));
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Bạn có chắc muốn xóa việc làm này? Việc làm sẽ được xóa vĩnh viễn khỏi hệ thống.')) {
      try {
        setActionLoading(prev => ({ ...prev, [`delete-${jobId}`]: true }));
        console.log('🗑️ [ADMIN JOBS PAGE] Deleting job:', jobId);

        // Use jobs API with authentication
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [ADMIN JOBS PAGE] Delete error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          // Try to parse error response
          let errorMessage = `Lỗi server: ${response.status} - ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            // Use default error message if parsing fails
          }

          if (response.status === 401) {
            showToast('❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
            router.push('/admin/login');
            return;
          } else if (response.status === 403) {
            showToast('❌ Không có quyền xóa việc làm này. Vui lòng kiểm tra quyền truy cập.', 'error');
            return;
          } else if (response.status === 404) {
            showToast('❌ Không tìm thấy việc làm để xóa.', 'error');
            return;
          } else if (response.status === 408) {
            showToast('❌ Request timeout. Server đang phản hồi chậm.', 'error');
            return;
          } else if (response.status === 503) {
            showToast('❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
            return;
          } else {
            showToast(`❌ ${errorMessage}`, 'error');
            return;
          }
        }

        const result = await response.json();

        if (result.success) {
          // Check if job was actually deleted or just marked as deleted
          if (result.data && result.data.status === 'deleted') {
            // Job was marked as deleted, update status in the list
            setJobs(prev =>
              prev.map(job => job.id === jobId ? { ...job, status: 'deleted' } : job)
            );
            showToast('✅ Đã đánh dấu việc làm là đã xóa!', 'success');
          } else {
            // Job was actually deleted, remove from list
            setJobs(prev => prev.filter(job => job.id !== jobId));
            showToast('✅ Đã xóa việc làm thành công!', 'success');
          }
        } else {
          showToast(`❌ ${result.message || 'Xóa việc làm thất bại'}`, 'error');
        }
      } catch (error) {
        console.error('💥 [ADMIN JOBS PAGE] Error deleting job:', error);
        showToast('❌ Có lỗi xảy ra khi xóa việc làm. Vui lòng thử lại.', 'error');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${jobId}`]: false }));
      }
    }
  };

  const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter);
  const displayedJobs = filteredJobs.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Đang tải danh sách việc làm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">

      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Quay lại Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý việc làm
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Tổng: {jobs.length} việc làm)
              </span>
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadJobs}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '⏳...' : '🔄 Làm mới'}
            </button>
            <Link
              href="/admin/create-sample-jobs"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📋 Tạo Jobs Mẫu
            </Link>
            <Link
              href="/admin/jobs/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Đăng việc làm mới
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Thông tin API</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• API Endpoint: <code className="bg-blue-100 px-1 rounded">/api/jobs</code></p>
                <p>• Backend API: <code className="bg-blue-100 px-1 rounded">https://vieclabbe.onrender.com/api/jobs</code></p>
                <p>• Authentication: Cookie-based (credentials: include)</p>
                <p>• Last updated: {new Date().toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>

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
                    onClick={loadJobs}
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
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả', color: 'bg-blue-600', count: jobs.length },
              { key: 'active', label: 'Đang hoạt động', color: 'bg-green-600', count: jobs.filter(j => j.status === 'active').length },
              { key: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-600', count: jobs.filter(j => j.status === 'pending').length },
              { key: 'expired', label: 'Hết hạn', color: 'bg-red-600', count: jobs.filter(j => j.status === 'expired').length },
              { key: 'deleted', label: 'Đã xóa', color: 'bg-gray-600', count: jobs.filter(j => j.status === 'deleted').length },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${filter === item.key ? `${item.color} text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Việc làm', 'Công ty', 'Địa điểm', 'Loại', 'Lương', 'Trạng thái', 'Ngày đăng', 'Thao tác'].map(head => (
                    <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Không có việc làm nào</td>
                  </tr>
                ) : (
                  displayedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate">{job.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate">{job.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{job.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{job.salary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            job.status === 'deleted' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {job.status === 'active' ? 'Đang hoạt động' :
                            job.status === 'pending' ? 'Chờ duyệt' :
                              job.status === 'deleted' ? 'Đã xóa' : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.postedDate === 'N/A' ? 'N/A' : new Date(job.postedDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {job.status === 'deleted' ? (
                          <span className="text-gray-500 text-xs">Không có thao tác</span>
                        ) : (
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/jobs/${job.id}/edit`}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                            >
                              Sửa
                            </Link>
                            {job.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(job.id, 'active')}
                                disabled={actionLoading[`status-${job.id}`]}
                                className={`px-3 py-1 rounded-md text-xs text-white ${actionLoading[`status-${job.id}`]
                                  ? 'bg-green-400 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600'
                                  }`}
                              >
                                {actionLoading[`status-${job.id}`] ? '⏳...' : 'Duyệt'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(job.id)}
                              disabled={actionLoading[`delete-${job.id}`]}
                              className={`px-3 py-1 rounded-md text-xs text-white ${actionLoading[`delete-${job.id}`]
                                ? 'bg-red-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                              {actionLoading[`delete-${job.id}`] ? '⏳...' : 'Xóa'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Xem thêm */}
        {visibleCount < filteredJobs.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
