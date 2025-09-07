"use client";

import React, { useState, useEffect } from "react";
interface Hiring {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description?: string;
  postedDate?: string;
}

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  job: Hiring | null;
};

export default function ApplyModal({ open, onClose, job }: ApplyModalProps) {
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
    if (!job) return;
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hiringId: job.id }),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-blue-700">Ứng tuyển Việc làm nổi bật: {job.title}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Họ tên"
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="border p-2 rounded"
            required
          />
          <input
            name="cv"
            value={form.cv}
            onChange={handleChange}
            placeholder="Link CV"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tin nhắn"
            className="border p-2 rounded"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi ứng tuyển'}
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-2 text-center text-sm text-green-700">{message}</div>
        )}
      </div>
    </div>
  );
}
