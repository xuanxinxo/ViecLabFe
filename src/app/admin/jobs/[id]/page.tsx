'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  isRemote: boolean;
  status: string;
  postedDate: string;
  deadline: string;
  img?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/jobs/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setJob(data.data);
        } else {
          setError(data.message || 'Không tìm thấy việc làm');
        }
      } catch (err) {
        console.error('Lỗi khi tải việc làm:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/jobs/${job.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
        alert(`Đã cập nhật trạng thái thành "${newStatus === 'active' ? 'Đang hoạt động' : newStatus}"`);
      } else {
        alert(`Lỗi: ${data.message || 'Có lỗi xảy ra khi cập nhật trạng thái'}`);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    if (confirm('Bạn có chắc muốn xóa việc làm này? Việc làm sẽ được đánh dấu là "đã xóa" và không hiển thị trên trang chủ.')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/jobs/${job.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Đã xóa việc làm thành công!');
          router.push('/admin/jobs');
        } else {
          alert(`Lỗi: ${data.message || 'Có lỗi xảy ra khi xóa việc làm'}`);
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Có lỗi xảy ra khi xóa việc làm. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy việc làm</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/admin/jobs" className="text-blue-600 underline hover:text-blue-800">
            ← Quay lại danh sách việc làm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/jobs" className="text-blue-600 hover:text-blue-800">
                ← Quay lại danh sách việc làm
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết việc làm</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/jobs/${job.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sửa việc làm
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa việc làm
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <p className="text-xl text-gray-600">{job.company}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                job.status === 'active' ? 'bg-green-100 text-green-800' :
                job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {job.status === 'active' ? 'Đang hoạt động' :
                 job.status === 'pending' ? 'Chờ duyệt' : 'Hết hạn'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">{job.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-gray-600">{job.salary}</span>
            </div>
          </div>

          {/* Status Actions */}
          {job.status === 'pending' && (
            <div className="mb-6">
              <button
                onClick={() => handleStatusChange('active')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ✅ Duyệt việc làm
              </button>
            </div>
          )}

          {/* Job Image */}
          {job.img && (
            <div className="mb-6">
              <img 
                src={job.img} 
                alt={job.title}
                className="w-full max-w-md h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Mô tả công việc</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{job.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu</h4>
              <ul className="space-y-2">
                {job.requirements && job.requirements.length > 0 ? (
                  job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Không có yêu cầu cụ thể</li>
                )}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Quyền lợi</h4>
              <ul className="space-y-2">
                {job.benefits && job.benefits.length > 0 ? (
                  job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Không có quyền lợi cụ thể</li>
                )}
              </ul>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khác</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Ngày đăng:</span>
              <span className="ml-2 text-gray-900">
                {new Date(job.postedDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Hạn nộp:</span>
              <span className="ml-2 text-gray-900">
                {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Remote:</span>
              <span className="ml-2 text-gray-900">
                {job.isRemote ? 'Có' : 'Không'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="ml-2 text-gray-900">
                {new Date(job.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
