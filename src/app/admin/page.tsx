"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from '../../lib/api';
import ApiStatus from '../../components/ui/ApiStatus';

interface DashboardStats {
  totalJobs: number;
  totalFreelancers: number;
  totalReviews: number;
  activeJobs: number;
  pendingJobs: number;
  totalApplications: number;
  totalNews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalFreelancers: 0,
    totalReviews: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalApplications: 0,
    totalNews: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        
        console.log("Loading dashboard stats...");
        
        // Fetch stats from the API with better error handling
        const [jobsResponse, newsResponse, applicationsResponse, hiringsResponse] = await Promise.allSettled([
          apiClient.jobs.getAll({}),
          apiClient.news.getAll({}),
          apiClient.applications.getAll({}),
          apiClient.hirings.getAll({})
        ]);
        
        // Process the responses with fallback
        const jobs = jobsResponse.status === 'fulfilled' ? ((jobsResponse.value as any).data || []) : [];
        const news = newsResponse.status === 'fulfilled' ? ((newsResponse.value as any).data || []) : [];
        const applications = applicationsResponse.status === 'fulfilled' ? ((applicationsResponse.value as any).data || []) : [];
        const hirings = hiringsResponse.status === 'fulfilled' ? ((hiringsResponse.value as any).data || []) : [];
        
        console.log("Dashboard data loaded:", { jobs: jobs.length, news: news.length, applications: applications.length, hirings: hirings.length });
        
        // Calculate stats
        const activeJobs = jobs.filter((job: any) => job.status === 'active' || job.status === 'published').length;
        const pendingJobs = jobs.filter((job: any) => job.status === 'pending' || job.status === 'draft').length;
        const totalJobCount = jobs.length + hirings.length; // Include hirings in total count
        
        setStats({
          totalJobs: totalJobCount,
          totalFreelancers: applications.length, // Use applications as freelancer count
          totalReviews: 0, // This needs a dedicated reviews endpoint
          activeJobs,
          pendingJobs,
          totalApplications: applications.length,
          totalNews: news.length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        // Set default stats if all API calls fail
        setStats({
          totalJobs: 0,
          totalFreelancers: 0,
          totalReviews: 0,
          activeJobs: 0,
          pendingJobs: 0,
          totalApplications: 0,
          totalNews: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboardStats();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include", //phải có để gửi cookie
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Đang tải dữ liệu dashboard...</div>
        </div>
      </div>
    );
  }

  // Remove this check to allow dashboard to show even with no data
  // if (stats.totalJobs === 0) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-xl text-red-600">
  //         Không thể tải dữ liệu dashboard. Vui lòng kiểm tra lại token hoặc đăng nhập lại!
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                TOREDCO Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ApiStatus />
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="Làm mới dữ liệu"
              >
                🔄 Làm mới
              </button>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Tổng việc làm
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Freelancers</p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.totalFreelancers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Đánh giá</p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.totalReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Việc làm đang hoạt động
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.pendingJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Ứng viên</p>
                <p className="text-xl font-semibold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Link
            href="/admin/jobs/create"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Đăng việc làm
              </h3> 
              <p className="text-xs text-gray-600">Tạo việc làm mới</p>
            </div>
          </Link>
           <Link
            href="/admin/jobnew/create"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-green-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Đăng việc làm TopNew
              </h3>
              <p className="text-xs text-gray-600">Tạo việc làm mới</p>
            </div>
          </Link>


          <Link
            href="/admin/jobs"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Quản lý việc làm
              </h3>
              <p className="text-xs text-gray-600">Xem và chỉnh sửa</p>
            </div>
          </Link>

          <Link
            href="/admin/newjobs"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-purple-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Quản lý NewJobs
              </h3>
              <p className="text-xs text-gray-600">Xem và quản lý</p>
            </div>
          </Link>

          <Link
            href="/admin/hirings"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-orange-100 rounded-lg mb-2">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Quản lý Hiring</h3>
              <p className="text-xs text-gray-600">Xem và chỉnh sửa</p>
            </div>
          </Link>

          <Link
            href="/admin/jobnew"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-yellow-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Quản lý JobNew
              </h3>
              <p className="text-xs text-gray-600">Xem và chỉnh sửa</p>
            </div>
          </Link>

          <Link
            href="/admin/applications"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-indigo-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Quản lý ứng viên
              </h3>
              <p className="text-xs text-gray-600">Xem và quản lý ứng viên</p>
            </div>
          </Link>

          <Link
            href="/admin/news"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-indigo-100 rounded-lg mb-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Đăng tin tức 
              </h3>
              <p className="text-xs text-gray-600">Xem tin tức</p>
            </div>
          </Link>
        </div>


      </div>
    </div>
  );
}
