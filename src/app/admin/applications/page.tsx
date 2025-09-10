"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { adminApi } from '../../../lib/backendApi';

interface Application {
  id: string;
  jobId?: string;
  hiringId?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  cv?: string;
  createdAt: string;
  hiring?: {
    id: string;
    title: string;
    company: string;
  };
  job?: {
    id: string;
    title: string;
    company: string;
  };
  newJob?: {
    id: string;
    title: string;
    company: string;
  };
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[ADMIN APPLICATIONS] Fetching applications from backend...');
      const applicationsData = await adminApi.applications.getAll();
      console.log(`[ADMIN APPLICATIONS] API response:`, applicationsData);

      // Handle response format: { success: true, data: { items: [...], pagination: {...} } }
      let applications = [];
      if (applicationsData.success && applicationsData.data && applicationsData.data.items && Array.isArray(applicationsData.data.items)) {
        applications = applicationsData.data.items;
      } else if (applicationsData.data && Array.isArray(applicationsData.data)) {
        applications = applicationsData.data;
      } else if (Array.isArray(applicationsData)) {
        applications = applicationsData;
      } else {
        console.error('[ADMIN APPLICATIONS] Invalid API response format:', applicationsData);
        throw new Error('Invalid API response format');
      }
      
      console.log(`[ADMIN APPLICATIONS] Fetched ${applications.length} applications from backend`);
      setApplications(applications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
      console.error('[ADMIN APPLICATIONS] Error:', errorMessage, err);
      setError(`Lỗi khi tải đơn ứng tuyển: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        router.push("/admin/login");
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ứng viên này?")) return;
    
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success) {
        setApplications(applications.filter(app => app.id !== id));
        alert("Xóa thành công!");
      } else {
        alert("Xóa thất bại: " + json.message);
      }
    } catch (e) {
      alert("Có lỗi khi xóa ứng viên");
    }
  };

  const getApplicationType = (app: Application) => {
    if (app.hiringId) return "Hiring";
    if (app.jobId) {
      // Cần kiểm tra xem là Job hay NewJob
      return "Job";
    }
    return "Unknown";
  };

  const getJobTitle = (app: Application) => {
    if (app.hiring) return app.hiring.title;
    if (app.job) return app.job.title;
    if (app.newJob) return app.newJob.title;
    return "N/A";
  };

  const getCompanyName = (app: Application) => {
    if (app.hiring) return app.hiring.company;
    if (app.job) return app.job.company;
    if (app.newJob) return app.newJob.company;
    return "N/A";
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getJobTitle(app).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" || 
      (filterType === "hiring" && app.hiringId) ||
      (filterType === "job" && app.jobId);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Ứng viên
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại việc làm
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="hiring">Hiring</option>
                <option value="job">Job</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng ứng viên</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hiring</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.hiringId).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Job</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.jobId).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => {
                    const today = new Date();
                    const appDate = new Date(app.createdAt);
                    return appDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách ứng viên ({filteredApplications.length})
            </h3>
          </div>
          
          {error && (
            <div className="p-6">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {filteredApplications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy ứng viên nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ứng viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vị trí ứng tuyển
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày ứng tuyển
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                          {app.phone && (
                            <div className="text-sm text-gray-500">{app.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getJobTitle(app)}</div>
                          <div className="text-sm text-gray-500">{getCompanyName(app)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getApplicationType(app) === 'Hiring' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getApplicationType(app)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết ứng viên</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Thông tin ứng viên</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Tên:</span> {selectedApplication.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                    {selectedApplication.phone && (
                      <p><span className="font-medium">Số điện thoại:</span> {selectedApplication.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Vị trí ứng tuyển</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Vị trí:</span> {getJobTitle(selectedApplication)}</p>
                    <p><span className="font-medium">Công ty:</span> {getCompanyName(selectedApplication)}</p>
                    <p><span className="font-medium">Loại:</span> {getApplicationType(selectedApplication)}</p>
                  </div>
                </div>

                {selectedApplication.message && (
                  <div>
                    <h4 className="font-medium text-gray-900">Tin nhắn</h4>
                    <p className="mt-2 text-gray-700">{selectedApplication.message}</p>
                  </div>
                )}

                {selectedApplication.cv && (
                  <div>
                    <h4 className="font-medium text-gray-900">CV</h4>
                    <p className="mt-2 text-gray-700">{selectedApplication.cv}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">Thời gian ứng tuyển</h4>
                  <p className="mt-2 text-gray-700">
                    {new Date(selectedApplication.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    deleteApplication(selectedApplication.id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa ứng viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 