'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    // Load jobs without authentication check
    loadJobs();
  }, [filter, router]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call newjobs API directly without authentication
      const response = await fetch('/api/jobs');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔍 [ADMIN JOBS PAGE] API Response:', result);
      
      // Handle different response formats
      let jobsData = [];
      if (result.data && Array.isArray(result.data)) {
        jobsData = result.data;
      } else if (Array.isArray(result)) {
        jobsData = result;
      } else if (result.success && Array.isArray(result.data)) {
        jobsData = result.data;
      }
      
      console.log('🔍 [ADMIN JOBS PAGE] Jobs data:', jobsData);
      
      // Format jobs data
      const formattedJobs = jobsData.map((job) => ({
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
    } catch (error) {
      console.error('💥 [ADMIN JOBS PAGE] Error loading jobs:', error);
      setError('Không thể tải danh sách việc làm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${jobId}`]: true }));
      console.log('🔄 [ADMIN JOBS PAGE] Updating job status:', { jobId, newStatus });
      
      // Simulate status update without API call
      // In a real app, you would call the API here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
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
        
        // Simulate delete without API call
        // In a real app, you would call the API here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Cập nhật trực tiếp danh sách thay vì load lại toàn bộ
        setJobs(prev => prev.filter(job => job.id !== jobId));
        showToast('✅ Đã xóa việc làm thành công!', 'success');
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
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4  mt-20">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý việc làm</h1>
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
                href="/admin/jobs/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Đăng việc làm mới
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === item.key ? `${item.color} text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status === 'active' ? 'Đang hoạt động' :
                           job.status === 'pending' ? 'Chờ duyệt' : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.postedDate === 'N/A' ? 'N/A' : new Date(job.postedDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                              className={`px-3 py-1 rounded-md text-xs text-white ${
                                actionLoading[`status-${job.id}`] 
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
                            className={`px-3 py-1 rounded-md text-xs text-white ${
                              actionLoading[`delete-${job.id}`] 
                                ? 'bg-red-400 cursor-not-allowed' 
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {actionLoading[`delete-${job.id}`] ? '⏳...' : 'Xóa'}
                          </button>
                        </div>
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
