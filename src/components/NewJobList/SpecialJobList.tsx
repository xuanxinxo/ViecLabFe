import React, { useEffect, useState } from 'react';
import NewJobApplyModal from '@/src/components/NewJobApplyModal';

export interface SpecialJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string | number;
  tags?: string[];
  isRemote?: boolean;
  createdAt?: string;
}

export default function SpecialJobList() {
  const [jobs, setJobs] = useState<SpecialJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError('');
      // Lấy 4 job đặc biệt đã được phê duyệt
      const res = await fetch('/api/newjobs?limit=4');
      const json = await res.json();
      if (json.jobs && Array.isArray(json.jobs)) {
        setJobs(json.jobs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, jobId: string) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, jobId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      setMessage('Ứng tuyển thành công!');
      setShowModal(null);
      setForm({ name: '', email: '', phone: '', cv: '' });
    } else {
      setMessage('Ứng tuyển thất bại!');
    }
  };

  const handleApplyClick = (jobId: string) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/)?.[1] ?? '')) : '';
    if (!token) {
      alert('Bạn cần đăng nhập để ứng tuyển!');
      window.location.href = '/login';
      return;
    }
    setShowModal(jobId);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {jobs.map(job => (
        <div key={job._id} className="border p-4 rounded-lg shadow-sm bg-white flex flex-col h-full">
          <h4 className="font-semibold text-lg text-blue-900 truncate">{job.title}</h4>
          <p className="text-gray-600">{job.company} - {job.location}</p>
          <div className="mt-2 flex gap-2">
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{job.salary}</span>
            {job.isRemote && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Remote</span>}
          </div>
          {job.tags && job.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {job.tags.map((tag, idx) => (
                <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          )}
          {job.createdAt && (
            <div className="mt-2 text-xs text-gray-400">Ngày tạo: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</div>
          )}
          <button
            className="mt-3 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            onClick={() => handleApplyClick(job._id)}
          >
            Ứng tuyển
          </button>
          <NewJobApplyModal open={showModal === job._id} onClose={() => setShowModal(null)} job={job} />
        </div>
      ))}
    </div>
  );
} 