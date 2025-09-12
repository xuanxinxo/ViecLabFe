'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../lib/api";
import { apiLoaders } from "../../lib/apiDataLoader";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  img?: string;
}

function ApplyModal({ open, onClose, job }: { open: boolean; onClose: () => void; job: Job | null }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cv: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setForm({ name: '', email: '', phone: '', cv: '', message: '' });
      setMessage('');
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, jobId: job?.id }),
    });
    const data = await res.json();
    console.log('Application response:', data);
    setSubmitting(false);
    
    // Handle nested response structure
    const isSuccess = data.success && (data.data?.success !== false);
    if (isSuccess) {
      setMessage('Ứng tuyển thành công!');
      setForm({ name: '', email: '', phone: '', cv: '', message: '' });
      setTimeout(() => onClose(), 1200);
    } else {
      setMessage('Ứng tuyển thất bại!');
    }
  };

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-blue-700">Ứng tuyển: {job.title}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" value={form.cv} onChange={handleChange} placeholder="Link CV" className="border p-2 rounded" required />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tin nhắn" className="border p-2 rounded" rows={3} />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi ứng tuyển'}
            </button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
        {message && <div className="mt-2 text-center text-sm text-green-700">{message}</div>}
      </div>
    </div>
  );
}

export default function CarouselJob() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true); // Show loading initially
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const [currentPage, setCurrentPage] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const router = useRouter();

  const jobsPerPage = 6; // 6 jobs per page, 2 pages = 12 total jobs
  const bgImages = ['/img/slide-1.png', '/img/slide-2.png'];

  const fetchJobs = async () => {
    try {
      setLoading(true); // Always show loading when fetching
      console.log('Fetching jobs using API loader...');
      
      // Use API loader to fetch jobs
      const result = await apiLoaders.jobs.load({
        limit: '12',
        pageSize: '12',
        per_page: '12'
      });
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} jobs successfully`);
        
        // Sort by date (newest first) and limit to 12 jobs (6 per page × 2 pages)
        const sortedJobs = [...result.data]
          .sort((a, b) => new Date(b.postedDate || b.createdAt).getTime() - new Date(a.postedDate || a.createdAt).getTime())
          .slice(0, 12);
        
        console.log('Sorted and limited to 12 jobs:', sortedJobs.length);
        
        setJobs(sortedJobs);
        setRetryCount(0); // Reset retry count on success
        setLoading(false); // Always stop loading when data is loaded
      } else {
        throw new Error(result.error || 'Failed to load jobs');
      }
      
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      
      // Retry up to 2 times
      if (retryCount < 2) {
        console.log(`Retrying... attempt ${retryCount + 1}/2`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchJobs();
        }, 2000); // Wait 2 seconds before retry
      } else {
        console.log('Max retries reached, using fallback data');
        // Use fallback data instead of empty array
        const fallbackJobs = [
          {
            id: 'fallback-1',
            title: 'Frontend Developer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '15-20 triệu',
            description: 'Phát triển ứng dụng web với React, Next.js',
            requirements: ['React', 'TypeScript', 'Next.js'],
            benefits: ['Lương thưởng hấp dẫn', 'Bảo hiểm y tế'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/tech.jpg'
          },
          {
            id: 'fallback-2',
            title: 'Backend Developer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '18-25 triệu',
            description: 'Phát triển API và hệ thống backend',
            requirements: ['Node.js', 'MongoDB', 'Express'],
            benefits: ['Stock options', 'Remote work'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/backend.jpg'
          },
          {
            id: 'fallback-3',
            title: 'UI/UX Designer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '12-18 triệu',
            description: 'Thiết kế giao diện người dùng',
            requirements: ['Figma', 'Adobe Creative Suite'],
            benefits: ['Môi trường sáng tạo', 'Đào tạo'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/design.jpg'
          }
        ];
        setJobs(fallbackJobs);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Clear any cached mock data and fetch fresh data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cachedJobs');
      console.log('Cleared cached jobs from localStorage');
    }
    fetchJobs();
  }, []);

  // Show loading when loading is true
  const shouldShowLoading = loading;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % 2);
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyJob = (job: Job) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/)?.[1] ?? '')
      : '';
    if (!token) {
      alert('Bạn cần đăng nhập để ứng tuyển!');
      router.push('/login');
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  if (shouldShowLoading) {
    return (
      <div className="w-full mt-14">
        <div className="text-center py-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="w-full mt-14">
        <div className="text-center py-10 text-gray-500">
          <p>Hiện chưa có việc làm nào.</p>
          <button 
            onClick={fetchJobs}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const currentJobs = jobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);

  return (
    <div className="w-full bg-gray-50 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 opacity-20 blur-sm"
        style={{ backgroundImage: `url(${bgImages[currentPage]})` }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Việc làm nổi bật</h2>
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1}/2 • {jobs.length} việc làm
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition relative flex flex-col h-full overflow-hidden transform hover:-translate-y-1 duration-300"
              >
                {/* Image */}
                <img
                  src={job.img || "/img/job-icon.svg"}
                  alt="Logo"
                  className="w-full h-60 object-contain bg-white rounded-t-md"
                />

                {/* Info */}
                <div className="flex-1 mt-3 space-y-1">
                  <h3 className="text-base font-semibold text-blue-700 line-clamp-2">{job.title}</h3>
                  <p className="text-gray-700 text-sm">{job.company}</p>
                  <p className="text-blue-600 text-sm font-medium">{job.salary}</p>
                  <p className="text-xs text-gray-500">{job.location}</p>
                  <span className="text-xs text-gray-400 block">
                    {job.postedDate ? new Date(job.postedDate).toLocaleDateString("vi-VN") : 'N/A'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-3 text-xs">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 whitespace-nowrap"
                    >
                      Ứng tuyển
                    </button>
                    <Link
                      href={`/banner/${job.id}`}
                      className="flex-1 text-center bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 whitespace-nowrap"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {[0, 1].map((i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full ${i === currentPage ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setCurrentPage(i)}
              />
            ))}
          </div>

          {/* View More */}
          <div className="flex justify-center mt-8">
            <Link href="/jobs" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Xem thêm việc làm →
            </Link>
          </div>
        </div>
      </div>

      <ApplyModal open={showApplyModal} onClose={() => setShowApplyModal(false)} job={selectedJob} />
    </div>
  );
}
