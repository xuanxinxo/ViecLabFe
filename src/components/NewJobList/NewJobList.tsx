"use client";

import { Job } from "@/src/app/types/job";
import JobCardNew from "./JobCardNew";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";

interface NewJobListProps {
  limit?: number;
  containerClassName?: string;
}

export default function NewJobList({
  limit = 4, // mặc định lấy 4 jobs
  containerClassName = "",
}: NewJobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs(limit);
  }, [limit]);

  async function loadJobs(limit: number) {
    try {
      setLoading(true);
      setError("");

      // Gọi API với limit từ props
      const response = await apiClient.newJobs.getAll({ limit, page: 1 });
      console.log("API Response:", response);

      if (Array.isArray(response)) {
        setJobs(response);
      } else if (response.success && Array.isArray(response.data)) {
        setJobs(response.data);
      } else if (response && Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Định dạng dữ liệu không hợp lệ từ máy chủ");
      }
    } catch (err: any) {
      console.error("Error loading jobs:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        stack: err.stack
      });
      
      if (err.isTimeout) {
        setError("Server đang phản hồi chậm. Vui lòng thử lại sau.");
      } else if (err.isNetworkError) {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.");
      } else if (err.status === 404) {
        setError("Không tìm thấy dữ liệu việc làm.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="h-full">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="border p-4 rounded-lg shadow-sm bg-white animate-pulse min-h-[260px]"
            >
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="h-full">
        <Header />
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Mở Developer Console (F12) để xem chi tiết lỗi
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError("");
                setLoading(true);
                loadJobs(limit);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
   <section className="h-full">
  <Header />
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${containerClassName}`}
  >
    {jobs.length === 0 ? (
      <div className="text-center py-8 text-gray-500 col-span-full">
        Chưa có việc làm nào được đăng
      </div>
    ) : (
      jobs.slice(0, 4).map((job) => (
        <div key={job._id || job.id} className="h-full">
          <JobCardNew job={job} />
        </div>
      ))
    )}
  </div>
</section>

  );
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-5 px-4">
      <h3 className="text-2xl font-bold text-center sm:text-left">
        Việc làm mới nhất cho các bạn 
      </h3>
      <Link
        href="/jobs"
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
      >
        Xem tất cả việc làm →
      </Link>
    </div>
  );
}
