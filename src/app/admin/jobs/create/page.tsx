'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../../lib/backendApi';

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline: string;
}

export default function CreateJob() {
  const router = useRouter();

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [''],
    benefits: [''],
    deadline: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'requirements' | 'benefits', idx: number, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? val : item)),
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'requirements' | 'benefits', idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Client-side validation
    if (!formData.title.trim()) {
      setError('Tiêu đề việc làm là bắt buộc');
      setSaving(false);
      return;
    }
    if (!formData.company.trim()) {
      setError('Tên công ty là bắt buộc');
      setSaving(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Địa điểm làm việc là bắt buộc');
      setSaving(false);
      return;
    }

    try {
      const form = new FormData();

      // Basic fields
      form.append('title', formData.title.trim());
      form.append('company', formData.company.trim());
      form.append('location', formData.location.trim());
      form.append('type', formData.type);
      form.append('salary', formData.salary.trim());
      form.append('description', formData.description.trim());
      
      // Handle deadline
      if (formData.deadline) {
        form.append('deadline', formData.deadline);
      }

      // Handle requirements array
      const validRequirements = formData.requirements.filter((r) => r.trim());
      validRequirements.forEach((req) => form.append('requirements', req.trim()));

      // Handle benefits array
      const validBenefits = formData.benefits.filter((b) => b.trim());
      validBenefits.forEach((ben) => form.append('benefits', ben.trim()));

      // Handle image upload
      if (selectedImage) {
        // Validate image file
        if (selectedImage.size > 5 * 1024 * 1024) { // 5MB limit
          setError('Kích thước file ảnh không được vượt quá 5MB');
          setSaving(false);
          return;
        }
        if (!selectedImage.type.startsWith('image/')) {
          setError('File phải là định dạng ảnh');
          setSaving(false);
          return;
        }
        form.append('img', selectedImage);
      }

      // Send FormData to backend API
      const data = await adminApi.jobs.create(form);

      if (data.success) {
        console.log('✅ [CREATE JOB] Create successful:', data);
        showToast('🎉 Tạo việc làm thành công!', 'success');
        
        // Reset form
        setFormData({
          title: '',
          company: '',
          location: '',
          type: 'Full-time',
          salary: '',
          description: '',
          requirements: [''],
          benefits: [''],
          deadline: '',
        });
        setSelectedImage(null);
        setError('');
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push('/admin/jobs');
        }, 1500);
      } else {
        console.error('❌ [CREATE JOB] Create failed:', data);
        setError(data.message || 'Tạo việc làm thất bại');
        showToast('❌ Tạo việc làm thất bại!', 'error');
      }
    } catch (err) {
      console.error('💥 [CREATE JOB] Unexpected error:', err);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo việc làm.';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        } else if (err.message.includes('JSON')) {
          errorMessage = 'Lỗi xử lý dữ liệu từ server.';
        } else {
          errorMessage = `Lỗi không xác định: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      showToast('❌ Có lỗi xảy ra khi tạo việc làm!', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tạo việc làm mới</h1>
          <button
            onClick={() => router.push('/admin/jobs')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Quay lại
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Nhập tiêu đề việc làm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Công ty *</label>
              <input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên công ty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="Nhập địa điểm làm việc"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương</label>
              <input
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="VD: 15.000.000 - 20.000.000 VND"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm, yêu cầu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
              <div className="mb-2">
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected Preview"
                      className="w-40 h-32 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ảnh đã chọn</p>
                  </div>
                ) : (
                  <div className="w-40 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Chưa có ảnh</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file ảnh, tối đa 5MB</p>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu công việc</label>
              {formData.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <span className="text-gray-500 mr-2 text-sm">{idx + 1}.</span>
                  <input
                    value={req}
                    onChange={(e) => handleArrayChange('requirements', idx, e.target.value)}
                    placeholder="Nhập yêu cầu công việc"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', idx)}
                      className="ml-2 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Xóa yêu cầu này"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Thêm yêu cầu
              </button>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quyền lợi</label>
              {formData.benefits.map((ben, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <span className="text-gray-500 mr-2 text-sm">{idx + 1}.</span>
                  <input
                    value={ben}
                    onChange={(e) => handleArrayChange('benefits', idx, e.target.value)}
                    placeholder="Nhập quyền lợi"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('benefits', idx)}
                      className="ml-2 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Xóa quyền lợi này"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Thêm quyền lợi
              </button>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp hồ sơ</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Đang tạo...' : 'Tạo việc làm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
