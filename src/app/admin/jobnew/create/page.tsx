'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type FieldArray = 'tags' | 'requirements' | 'benefits';

type FormState = {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Freelance' | 'Internship';
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline: string; // yyyy-mm-dd
  tags: string[];
  img: string; // URL ảnh
  isRemote: boolean;
};

const initialForm: FormState = {
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  description: '',
  requirements: [''],
  benefits: [''],
  deadline: '',
  tags: [''],
  img: '',
  isRemote: false,
};

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // chặn truy cập nếu chưa đăng nhập admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin/login');
    }
  }, [router]);

  // min date cho deadline = hôm nay
  const minDeadline = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const onInput =
    (name: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === 'checkbox'
          ? (e.currentTarget as HTMLInputElement).checked
          : e.currentTarget.value;
      setFormData((p) => ({ ...p, [name]: value as any }));
    };

  const onArrayChange = (field: FieldArray, idx: number, value: string) => {
    setFormData((p) => ({
      ...p,
      [field]: p[field].map((item, i) => (i === idx ? value : item)),
    }));
  };

  const addArrayItem = (field: FieldArray) =>
    setFormData((p) => ({ ...p, [field]: [...p[field], ''] }));

  const removeArrayItem = (field: FieldArray, idx: number) =>
    setFormData((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // validate cơ bản
      if (!formData.title || !formData.company || !formData.location || !formData.description || !formData.deadline) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        router.replace('/admin/login');
        return;
      }

      const payload = {
        ...formData,
        salary: formData.salary || 'Thỏa thuận',
        tags: formData.tags.map((t) => t.trim()).filter(Boolean),
        requirements: formData.requirements.map((r) => r.trim()).filter(Boolean),
        benefits: formData.benefits.map((b) => b.trim()).filter(Boolean),
      };

      const res = await fetch('/api/admin/newjobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Đã có lỗi xảy ra khi tạo việc làm.');
      }

      setSuccess(true);
      // chuyển về trang quản lý job mới
      setTimeout(() => router.push('/admin/newjobs'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Tạo việc làm thành công!</h2>
          <p className="text-gray-600 mb-4">Việc làm đã được tạo với trạng thái "Chờ duyệt".</p>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">
              <strong>Lưu ý:</strong> Việc làm cần được admin phê duyệt trước khi hiển thị trên website.
            </p>
          </div>
          <p className="text-gray-600 mt-4">Đang chuyển hướng về trang quản lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-10">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-16">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mr-4">
            ← Quay lại
          </button>
          <h1 className="text-xl font-bold">Đăng việc làm mới</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Thông báo quy trình phê duyệt */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Quy trình phê duyệt</h3>
              <p className="mt-2 text-sm">
                Việc làm mới sẽ được tạo với trạng thái "Chờ duyệt". Admin cần phê duyệt trước khi hiển thị.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>
          )}

          {/* BASIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề việc làm *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={onInput('title')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Công ty */}
            <div>
              <label className="block text-sm font-medium mb-1">Công ty *</label>
              <input
                required
                type="text"
                name="company"
                value={formData.company}
                onChange={onInput('company')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium mb-1">Địa điểm *</label>
              <input
                required
                type="text"
                name="location"
                value={formData.location}
                onChange={onInput('location')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Loại */}
            <div>
              <label className="block text-sm font-medium mb-1">Loại việc làm *</label>
              <select
                required
                name="type"
                value={formData.type}
                onChange={onInput('type')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Lương */}
            <div>
              <label className="block text-sm font-medium mb-1">Mức lương</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={onInput('salary')}
                placeholder="VD: 15-20 triệu VND"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium mb-1">Hạn nộp hồ sơ *</label>
              <input
                required
                type="date"
                name="deadline"
                value={formData.deadline}
                min={minDeadline}
                onChange={onInput('deadline')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ảnh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Ảnh minh họa (URL)</label>
              <input
                type="url"
                name="img"
                value={formData.img}
                onChange={onInput('img')}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formData.img && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.img} alt="Preview" className="h-28 rounded border object-cover" />
                </div>
              )}
            </div>

            {/* Remote */}
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={onInput('isRemote')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Công việc từ xa (Remote)</span>
              </label>
            </div>
          </div>

          {/* MÔ TẢ */}
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả công việc *</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={onInput('description')}
              rows={5}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* YÊU CẦU */}
          <ArrayEditor
            label="Yêu cầu công việc"
            items={formData.requirements}
            onAdd={() => addArrayItem('requirements')}
            onRemove={(i) => removeArrayItem('requirements', i)}
            onChange={(i, v) => onArrayChange('requirements', i, v)}
            placeholder="VD: Kinh nghiệm 2+ năm với React"
          />

          {/* QUYỀN LỢI */}
          <ArrayEditor
            label="Quyền lợi"
            items={formData.benefits}
            onAdd={() => addArrayItem('benefits')}
            onRemove={(i) => removeArrayItem('benefits', i)}
            onChange={(i, v) => onArrayChange('benefits', i, v)}
            placeholder="VD: Bảo hiểm sức khỏe, thưởng dự án"
          />

          {/* TAGS */}
          <ArrayEditor
            label="Tags"
            items={formData.tags}
            onAdd={() => addArrayItem('tags')}
            onRemove={(i) => removeArrayItem('tags', i)}
            onChange={(i, v) => onArrayChange('tags', i, v)}
            placeholder="VD: React, Node.js, Remote"
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo việc làm'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/** -------------------- Sub Components -------------------- */

function ArrayEditor(props: {
  label: string;
  items: string[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onChange: (idx: number, value: string) => void;
  placeholder?: string;
}) {
  const { label, items, onAdd, onRemove, onChange, placeholder } = props;
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {items.map((val, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input
            type="text"
            value={val}
            onChange={(e) => onChange(idx, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Xóa
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        + Thêm
      </button>
    </div>
  );
}
