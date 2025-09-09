'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  img?: string;
}

export default function EditJob() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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
    img: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // No authentication needed for public API

    console.log('🔍 [EDIT JOB] Loading job with ID:', id);

    fetch(`/api/jobs/${id}`)
      .then(async (res) => {
        console.log('📥 [EDIT JOB] Response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ [EDIT JOB] Load job error:', {
            status: res.status,
            statusText: res.statusText,
            error: errorText
          });
          
          if (res.status === 401) {
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            router.push('/admin/login');
            return;
          } else if (res.status === 404) {
            setError(`Không tìm thấy việc làm với ID: ${id}. Vui lòng kiểm tra lại ID hoặc thử tạo job mới.`);
            return;
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        }
        
        return res.json();
      })
      .then((data) => {
        console.log('📊 [EDIT JOB] Response data:', data);
        
        if (data && data.success) {
          const j = data.data;
          const deadlineValue = j?.deadline
            ? new Date(j.deadline).toISOString().slice(0, 10)
            : '';

          setFormData({
            title: j.title || '',
            company: j.company || '',
            location: j.location || '',
            type: j.type || 'Full-time',
            salary: j.salary || '',
            description: j.description || '',
            requirements: Array.isArray(j.requirements) && j.requirements.length ? j.requirements : [''],
            benefits: Array.isArray(j.benefits) && j.benefits.length ? j.benefits : [''],
            deadline: deadlineValue,
            img: j.img || '',
          });
          
          console.log('✅ [EDIT JOB] Job data loaded successfully:', j);
        } else {
          setError(data?.message || 'Không thể tải thông tin việc làm');
        }
      })
      .catch((err) => {
        console.error('💥 [EDIT JOB] Load job error:', err);
        setError('Lỗi kết nối khi tải thông tin việc làm');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

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
      form.append('requirementsPresent', '1');

      // Handle benefits array
      const validBenefits = formData.benefits.filter((b) => b.trim());
      validBenefits.forEach((ben) => form.append('benefits', ben.trim()));
      form.append('benefitsPresent', '1');

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

      // No authentication needed for public API

      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          company: formData.company.trim(),
          location: formData.location.trim(),
          type: formData.type,
          salary: formData.salary.trim(),
          description: formData.description.trim(),
          requirements: formData.requirements.filter(r => r.trim()),
          benefits: formData.benefits.filter(b => b.trim()),
          deadline: formData.deadline,
          img: selectedImage ? 'uploaded_image' : formData.img
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ [EDIT JOB] HTTP Error:', {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        
        if (res.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          router.push('/admin/login');
          return;
        } else if (res.status === 404) {
          setError('Không tìm thấy việc làm để cập nhật.');
          return;
        } else {
          setError(`Lỗi server: ${res.status} - ${res.statusText}`);
          return;
        }
      }

      const data = await res.json();

      if (data.success) {
        console.log('✅ [EDIT JOB] Update successful:', data);
        alert('Cập nhật việc làm thành công!');
        router.push('/admin/jobs');
      } else {
        console.error('❌ [EDIT JOB] Update failed:', data);
        const errorMessage = data.message || 'Cập nhật thất bại';
        const errorDetails = data.details ? `\n\nChi tiết: ${data.details}` : '';
        setError(`${errorMessage}${errorDetails}`);
      }
    } catch (err) {
      console.error('💥 [EDIT JOB] Unexpected error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
        } else if (err.message.includes('JSON')) {
          setError('Lỗi xử lý dữ liệu từ server.');
        } else {
          setError(`Lỗi không xác định: ${err.message}`);
        }
      } else {
        setError('Có lỗi xảy ra khi cập nhật việc làm.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Đang tải thông tin việc làm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sửa việc làm</h1>
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
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => router.push('/admin/jobs')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Quay lại danh sách
                  </button>
                  <button
                    onClick={() => router.push('/admin/jobs/create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Tạo job mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Job Info Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Thông tin việc làm hiện tại</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Tiêu đề:</span> {formData.title || 'Chưa có'}
            </div>
            <div>
              <span className="font-medium text-gray-700">Công ty:</span> {formData.company || 'Chưa có'}
            </div>
            <div>
              <span className="font-medium text-gray-700">Địa điểm:</span> {formData.location || 'Chưa có'}
            </div>
            <div>
              <span className="font-medium text-gray-700">Loại:</span> {formData.type || 'Chưa có'}
            </div>
          </div>
        </div>
        
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

            {/* Image preview and upload */}
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
                    <p className="text-xs text-gray-500 mt-1">Ảnh mới đã chọn</p>
                  </div>
                ) : formData.img ? (
                  <div className="relative">
                    <img
                      src={formData.img}
                      alt="Current Image"
                      className="w-40 h-32 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ảnh hiện tại</p>
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
              {saving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
