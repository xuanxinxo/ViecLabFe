"use client";

import React, { useState, useEffect } from "react";

interface Job {
  id?: string | number;
  _id?: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  postedDate?: string;
}

interface UnifiedApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  type?: 'job' | 'hiring' | 'newjob'; // Type để phân biệt loại job
}

export default function UnifiedApplyModal({ 
  open, 
  onClose, 
  job, 
  type = 'job' 
}: UnifiedApplyModalProps) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    cv: '', 
    message: '' 
  });
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
    if (!job) return;
    
    setSubmitting(true);
    setMessage('');
    
    try {
      // Xác định ID field dựa trên type
      const jobId = job.id || job._id;
      const requestBody = { ...form };
      
      if (type === 'hiring') {
        requestBody.hiringId = jobId;
      } else {
        requestBody.jobId = jobId;
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      console.log('Application response:', data);
      
      // Handle nested response structure
      const isSuccess = data.success && (data.data?.success !== false);
      if (isSuccess) {
        setMessage('Ứng tuyển thành công!');
        setForm({ name: '', email: '', phone: '', cv: '', message: '' });
        setTimeout(onClose, 1200);
      } else {
        setMessage('Ứng tuyển thất bại!');
      }
    } catch (err) {
      console.error(err);
      setMessage('Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !job) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'hiring':
        return `Ứng tuyển Việc làm nổi bật: ${job.title}`;
      case 'newjob':
        return `Ứng tuyển việc mới: ${job.title}`;
      default:
        return `Ứng tuyển: ${job.title}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-4 text-gray-400 text-2xl hover:text-gray-700 transition"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-center text-blue-800 mb-4">
          {getModalTitle()}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Họ tên"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="cv"
            value={form.cv}
            onChange={handleChange}
            placeholder="Link CV"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tin nhắn (tùy chọn)"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi ứng tuyển"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Hủy
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-3 text-sm text-green-700">{message}</p>
        )}
      </div>
    </div>
  );
}


