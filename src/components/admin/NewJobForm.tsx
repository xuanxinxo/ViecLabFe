'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';

interface NewJobFormProps {
  job?: {
    id?: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    requirements: string[];
    benefits: string[];
    tags: string[];
    deadline: string;
    isRemote: boolean;
    status: string;
    image?: string;
  };
  isEditing?: boolean;
}

export function NewJobForm({ job, isEditing = false }: NewJobFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    type: job?.type || 'Full-time',
    salary: job?.salary || '',
    description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '',
    benefits: job?.benefits?.join('\n') || '',
    tags: job?.tags?.join(', ') || '',
    deadline: job?.deadline || '',
    isRemote: job?.isRemote || false,
    status: job?.status || 'active',
    image: job?.image || '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(job?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ.');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(Boolean),
        benefits: formData.benefits.split('\n').filter(Boolean),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        deadline: new Date(formData.deadline).toISOString(),
      };

      if (selectedImage) {
        // Nếu có hình ảnh mới, gửi FormData
        const formDataToSend = new FormData();
        
        // Thêm các trường dữ liệu
        Object.keys(jobData).forEach(key => {
          if (key === 'requirements' || key === 'benefits' || key === 'tags') {
            formDataToSend.append(key, JSON.stringify(jobData[key as keyof typeof jobData]));
          } else if (key === 'isRemote') {
            formDataToSend.append(key, (jobData[key as keyof typeof jobData] as boolean).toString());
          } else {
            formDataToSend.append(key, jobData[key as keyof typeof jobData] as string);
          }
        });
        
        // Thêm file hình ảnh
        formDataToSend.append('image', selectedImage);
        
        // Gửi request với FormData
        const url = isEditing && job?.id ? `/api/admin/newjobs/${job.id}` : '/api/admin/newjobs';
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          body: formDataToSend,
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Có lỗi xảy ra');
        }
      } else {
        // Nếu không có hình ảnh mới, gửi JSON như cũ
        if (isEditing && job?.id) {
          await apiClient.newJobs.update(job.id, jobData);
        } else {
          await apiClient.newJobs.create(jobData);
        }
      }
      
      router.push('/admin/newjobs');
      router.refresh();
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Có lỗi xảy ra khi lưu công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tiêu đề công việc *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Công ty *</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Địa điểm *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Loại công việc *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Full-time">Toàn thời gian</option>
            <option value="Part-time">Bán thời gian</option>
            <option value="Contract">Hợp đồng</option>
            <option value="Internship">Thực tập</option>
            <option value="Freelance">Tự do</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mức lương</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="VD: 15.000.000 - 20.000.000 VND"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Hạn nộp hồ sơ *</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="active">Đang tuyển</option>
            <option value="inactive">Tạm dừng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="isRemote"
            name="isRemote"
            checked={formData.isRemote}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRemote" className="text-sm font-medium text-gray-700">
            Làm việc từ xa
          </label>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Hình ảnh công việc
        </label>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Chấp nhận: JPG, PNG, GIF. Tối đa 5MB
            </p>
          </div>
          
          {imagePreview && (
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Xóa ảnh
            </button>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs max-h-48 rounded-lg border border-gray-300 shadow-sm"
              />
              {selectedImage && (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Mới
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Mô tả công việc *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Yêu cầu công việc (mỗi yêu cầu một dòng) *</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="- Yêu cầu 1&#10;- Yêu cầu 2"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Quyền lợi (mỗi quyền lợi một dòng)</label>
        <textarea
          name="benefits"
          value={formData.benefits}
          onChange={handleChange}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="- Quyền lợi 1&#10;- Quyền lợi 2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tags (cách nhau bằng dấu phẩy)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="VD: React, Node.js, JavaScript"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/admin/newjobs')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}








