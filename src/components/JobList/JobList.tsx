"use client";

// import { Job } from "@/types/job";
import { Job } from "@/types/job";
import JobCard from "./JobCard";
import UnifiedApplyModal from "../UnifiedApplyModal";



import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";

interface JobListProps {
  limit?: number;
  containerClassName?: string;
}

export default function JobList({
  limit = 3,
  containerClassName = "",
}: JobListProps) {
  const [hirings, setHirings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadHirings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHirings() {
    try {
      setLoading(true);
      setError("");

      console.log("Loading hirings using API client...");
      
      // Use API client to fetch hirings
      const responseData = await apiClient.hirings.getAll({});
      console.log("API Response:", responseData);
      
      // Handle backend response format: {success: true, count: 29, data: [...]}
      let hiringsData: Job[] = [];
      
      if (responseData.success && Array.isArray(responseData.data)) {
        // Backend format: {success: true, data: [...]}
        hiringsData = responseData.data;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Nested data response
        hiringsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Direct array response
        hiringsData = responseData;
      } else {
        console.error("Unexpected response format:", responseData);
        throw new Error("Invalid response format");
      }
      
      console.log("Processed hirings data:", hiringsData);
      setHirings(hiringsData.slice(0, limit));
      
    } catch (err: any) {
      console.error("Error loading hirings:", err);
      
      // Handle different types of errors
      if (err.isTimeout) {
        setError("Server đang phản hồi chậm. Vui lòng thử lại sau.");
      } else if (err.isNetworkError) {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.");
      } else if (err.status === 404) {
        setError("Không tìm thấy dữ liệu tuyển dụng.");
      } else {
        setError("Có lỗi xảy ra khi tải dữ liệu");
      }
      setHirings([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="h-full w-full">
      <Header />

      <div className={`grid gap-4 max-w-4xl w-full mx-auto px-4 ${containerClassName}`}>
        {loading &&
          [...Array(limit)].map((_, i) => (
            <div key={i} className="border p-4 rounded-lg shadow-sm bg-white animate-pulse">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && error && (
          <div className="text-center py-8 col-span-full">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium">{error}</p>
            </div>
            <button
              onClick={() => {
                setError("");
                setLoading(true);
                loadHirings();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && hirings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có tin tuyển dụng nào được đăng
          </div>
        )}

        {!loading &&
          !error &&
          hirings.map((job) => (
            <div
              className="transition-transform transform hover:-translate-y-1 hover:shadow-lg duration-300"
              key={job.id || job._id}
            >
              <JobCard job={job} onApply={() => setSelectedJob(job)} />
            </div>
          ))}
      </div>

      {selectedJob && (
        <UnifiedApplyModal
          open={true}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          type="job"
        />
      )}
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 max-w-6xl mx-auto px-4">
      <h3 className="text-xl sm:text-2xl font-bold text-center sm:text-left break-words">
        Tin tuyển dụng mới nhất
      </h3>
      <Link
        href="/hirings"
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
      >
        Xem tất cả →
      </Link>
    </div>
  );
}