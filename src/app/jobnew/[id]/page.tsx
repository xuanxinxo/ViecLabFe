'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ApplyModal from '../../../components/ApplyModal';

interface NewJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline?: string;
  img?: string;
  status: string;
}

export default function NewJobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<NewJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<NewJob | null>(null);

  const handleApplyJob = (job: NewJob) => {
    const token =
      typeof window !== 'undefined'
        ? (localStorage.getItem('token') ?? document.cookie.match(/token=([^;]+)/)?.[1] ?? '')
        : '';

    if (!token) {
      alert('Bạn cần đăng nhập để ứng tuyển!');
      router.push('/login');
      return;
    }

    setSelectedJob(job);
    setShowApplyModal(true);
  };

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const res = await fetch(`/api/newjobs/${params.id}`);
        const responseData = await res.json();
        
        if (res.ok && responseData.success) {
          setJob(responseData.data);
        } else {
          setError(responseData.message || 'Không tìm thấy việc làm');
        }
      } catch (err) {
        console.error('Lỗi khi tải công việc:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">
        <span className="text-lg font-medium animate-pulse">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy việc làm</h2>
          <Link href="/" className="text-blue-600 underline hover:text-blue-800">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-20">
      <header className="bg-white shadow-sm border-b mb-8 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Quay lại trang chủ
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h2>
                <p className="text-lg font-medium">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm mt-3 text-blue-100">
                  <span>📍 {job.location}</span>
                  <span>💼 {job.type}</span>
                  <span>💰 {job.salary}</span>
                </div>
                <div className="mt-3 text-sm text-blue-100">
                  Ngày đăng:{' '}
                  <span className="font-semibold">
                    {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {job.img && (
                <div className="w-full md:w-48 h-36 bg-white rounded-md overflow-hidden flex items-center justify-center shadow-sm">
                  <img
                    src={job.img}
                    alt={`${job.title} image`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Nội dung */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bên trái */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Mô tả công việc</h3>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </section>

              {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📌 Yêu cầu công việc</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {job.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">🎁 Quyền lợi</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {job.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Bên phải */}
            <aside className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-5">
                <h4 className="text-base font-semibold text-gray-800 mb-3">Nộp hồ sơ ngay</h4>
                <button
                  onClick={() => handleApplyJob(job)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition"
                >
                  Ứng tuyển
                </button>
                {job.deadline && (
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

              <div className="bg-gray-100 rounded-lg p-5">
                <h4 className="text-base font-semibold text-gray-800 mb-3">📃 Thông tin việc làm</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>Công ty:</strong> {job.company}
                  </p>
                  <p>
                    <strong>Địa điểm:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Loại hình:</strong> {job.type}
                  </p>
                  <p>
                    <strong>Mức lương:</strong> {job.salary}
                  </p>
                  <p>
                    <strong>Ngày đăng:</strong>{' '}
                    {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                  </p>
                  {job.deadline && (
                    <p>
                      <strong>Hạn nộp:</strong> {new Date(job.deadline).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-5 text-sm text-gray-600 text-center">
                <p>🌐 Chia sẻ tin tuyển dụng lên mạng xã hội</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Modal ứng tuyển */}
      <ApplyModal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={selectedJob}
      />
    </div>
  );
}