"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  img?: string;
};

const JobCard = ({ job }: { job: Job }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {job.img && (
          <div className="flex-shrink-0">
            <img
              src={job.img}
              alt={`${job.company} logo`}
              className="h-16 w-16 rounded-md object-contain"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {job.type}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {job.salary}
            </span>
          </div>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Ứng tuyển ngay
          </button>
        </div>
      </div>
    </div>
  </div>
);

const JobCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-4 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="h-16 w-16 rounded-md bg-gray-200"></div>
      <div className="flex-1 space-y-2">
        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function OptimizedSearchPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNoJobsMessage, setShowNoJobsMessage] = useState(false);
  
  // Get search parameters
  const jobTitle = searchParams.get("search") || "";
  const province = searchParams.get("location") || "";
  const cacheRef = useRef<{
    jobs: Job[];
    timestamp: number;
    search: string;
    location: string;
  } | null>(null);

  // Fetch jobs with caching
  const fetchJobs = useCallback(async () => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    // Check cache first
    if (
      cacheRef.current && 
      now - cacheRef.current.timestamp < CACHE_DURATION &&
      cacheRef.current.search === jobTitle &&
      cacheRef.current.location === province
    ) {
      setJobs(cacheRef.current.jobs);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setShowNoJobsMessage(false);

    try {
      const params = new URLSearchParams();
      if (jobTitle) params.append("search", jobTitle);
      if (province) params.append("location", province);
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ");
      }

      const data = await response.json();
      
      if (!Array.isArray(data.jobs)) {
        throw new Error("Dữ liệu không hợp lệ từ máy chủ");
      }

      // Update cache
      cacheRef.current = {
        jobs: data.jobs,
        timestamp: now,
        search: jobTitle,
        location: province
      };

      setJobs(data.jobs);
      setShowNoJobsMessage(data.jobs.length === 0);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
      setShowNoJobsMessage(true);
    } finally {
      setLoading(false);
    }
  }, [jobTitle, province]);

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Scroll to top when search changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [jobTitle, province]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Search summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Kết quả tìm kiếm</h1>
        {(jobTitle || province) && (
          <p className="text-gray-600">
            {jobTitle && <span>Việc làm: <span className="font-medium">{jobTitle}</span> </span>}
            {province && <span>tại <span className="font-medium">{province}</span></span>}
          </p>
        )}
        {!loading && (
          <p className="text-sm text-gray-500 mt-1">
            Đang hiển thị {jobs.length} công việc
            {jobTitle || province ? ' phù hợp với tìm kiếm của bạn' : ''}
          </p>
        )}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {loading ? (
          // Show skeleton loaders
          Array(6).fill(0).map((_, i) => <JobCardSkeleton key={i} />)
        ) : error ? (
          // Show error message
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : showNoJobsMessage ? (
          // Show no jobs message
          <div className="text-center py-10">
            <p>Không tìm thấy công việc phù hợp</p>
            <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline font-semibold">
              Xem tất cả việc làm
            </Link>
          </div>
        ) : (
          // Show job listings
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
