'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  status: string;
}

export default function JobDetail() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJob();
  }, [params.id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setJob(data.data);
      } else {
        setError('Không tìm thấy việc làm');
      }
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy việc làm</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Quay lại trang chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết việc làm</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Job Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <p className="text-xl mb-4">{job.company}</p>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span>📍 {job.location}</span>
                  <span>💼 {job.type}</span>
                  <span>💰 {job.salary}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Đăng ngày</div>
                <div className="font-semibold">{new Date(job.postedDate).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Job Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả công việc</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu công việc</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi</h2>
                    <ul className="space-y-2">
                      {job.benefits.map((ben, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">🎁</span>
                          <span className="text-gray-700">{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Button */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ứng tuyển ngay</h3>
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Nộp hồ sơ ứng tuyển
                  </button>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Job Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin việc làm</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Công ty:</span>
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa điểm:</span>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại việc làm:</span>
                      <span className="font-medium">{job.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mức lương:</span>
                      <span className="font-medium">{job.salary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đăng:</span>
                      <span className="font-medium">{new Date(job.postedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hạn nộp:</span>
                      <span className="font-medium">{new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ</h3>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors">
                      Facebook
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition-colors">
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 