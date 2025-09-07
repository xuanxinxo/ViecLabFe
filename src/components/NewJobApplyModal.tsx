"use client";

import React, { useState } from 'react';
import { SpecialJob } from './NewJobList/SpecialJobList';

interface NewJobApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: SpecialJob;
}

export default function NewJobApplyModal({ open, onClose, job }: NewJobApplyModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jobId: job._id }),
      });
      const data = await res.json();
      console.log('Application response:', data);
      
      // Handle nested response structure
      const isSuccess = data.success && (data.data?.success !== false);
      if (isSuccess) {
        setMessage('Ứng tuyển thành công!');
        setForm({ name: '', email: '', phone: '', cv: '' });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-blue-700">Ứng tuyển việc mới: {job.title}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" value={form.cv} onChange={handleChange} placeholder="Link CV" className="border p-2 rounded" required />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi ứng tuyển'}
            </button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
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
