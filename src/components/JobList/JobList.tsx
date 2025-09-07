"use client";

// import { Job } from "@/types/job";
import { Job } from "@/types/job";
import JobCard from "./JobCard";
import JobApplyModal from "../JobApplyModal";
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      console.log("Loading jobs from hirings API...");
      
      // Using the new API client with proper typing
      const response = await apiClient.hirings.getAll();
      console.log("API Response:", response);
      
      // Handle different response formats
      let jobsData: Job[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Direct array response
        jobsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Nested data response
        jobsData = response.data.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        jobsData = response;
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format");
      }
      
      console.log("Processed jobs data:", jobsData);
      setJobs(jobsData.slice(0, limit));
      
    } catch (err: any) {
      console.error("Error loading jobs:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
      setJobs([]);
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
          <div className="text-center py-8 text-gray-500">
            {error}
            <button
              onClick={loadJobs}
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có việc làm nào được đăng
          </div>
        )}

        {!loading &&
          !error &&
          jobs.map((job) => (
            <div
              className="transition-transform transform hover:-translate-y-1 hover:shadow-lg duration-300"
              key={job.id || job._id}
            >
              <JobCard job={job} onApply={() => setSelectedJob(job)} />
            </div>
          ))}
      </div>

      {selectedJob && (
        <JobApplyModal
          open={true}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
        />
      )}
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 max-w-6xl mx-auto px-4">
      <h3 className="text-xl sm:text-2xl font-bold text-center sm:text-left break-words">
        Việc làm mới nhất
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