"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Job } from "../jobs/page";
import { SuspenseBoundary } from "@/components/SuspenseBoundary";
import { debounce } from "lodash";

// Skeleton loader
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

export default function SearchResultsPage() {
  return (
    <SuspenseBoundary>
      <SearchContent />
    </SuspenseBoundary>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const jobTitle = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const province = useMemo(() => searchParams.get("location") || "", [searchParams]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNoJobsMessage, setShowNoJobsMessage] = useState(false);

  const isMounted = useRef(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch jobs with optimized performance
  const fetchJobs = useCallback(
    async (pageNum: number, searchTerm: string, locationTerm: string) => {
      try {
        const isInitialLoad = pageNum === 1;
        if (isInitialLoad) {
          setLoading(true);
          setError("");
          setShowNoJobsMessage(false);
        } else {
          setLoadingMore(true);
        }

        // Build query parameters
        const searchQuery = searchTerm.trim();
        const locationQuery = locationTerm.trim();
        
        const params = new URLSearchParams({
          q: searchQuery,  // Using 'q' as the search parameter as per REST conventions
          location: locationQuery,
          _page: pageNum.toString(),
          _limit: "10",
          _sort: 'postedDate',
          _order: 'desc',
          status: 'active'  // Only show active jobs
        });

        // Add cache-busting parameter
        params.append('_t', Date.now().toString());

        // Log the request URL and parameters
        const apiUrl = `/api/jobs?${params.toString()}`;
        console.log('Making API request to:', apiUrl);
        console.log('Search parameters:', { searchQuery, locationQuery, pageNum });

        // Make the API request
        const startTime = performance.now();
        const response = await fetch(apiUrl);
        const loadTime = performance.now() - startTime;
        
        console.log(`API response time: ${loadTime.toFixed(2)}ms`);
        console.log('Response status:', response.status);

        if (!isMounted.current) return;
        if (!response.ok) {
          throw new Error("Không thể kết nối đến máy chủ");
        }

        const data = await response.json();
        console.log('API response data:', data);
        
        // Handle the API response structure
        if (!data) {
          console.error('Empty response from server');
          throw new Error("Không nhận được dữ liệu từ máy chủ");
        }
        
        // Extract jobs data from the response structure
        let jobsData: Job[] = [];
        let totalCount = 0;
        
        // Handle the new API response format
        if (data.success && Array.isArray(data.data)) {
          jobsData = data.data;
          totalCount = data.count || data.pagination?.total || jobsData.length;
        } 
        // Fallback to old formats for backward compatibility
        else if (data.jobs && data.jobs.success && Array.isArray(data.jobs.data)) {
          jobsData = data.jobs.data;
          totalCount = data.jobs.count || jobsData.length;
        } else if (Array.isArray(data.data)) {
          jobsData = data.data;
          totalCount = data.count || data.total || jobsData.length;
        } else if (Array.isArray(data)) {
          jobsData = data;
          totalCount = jobsData.length;
        } else {
          console.error('Unexpected response format:', data);
          throw new Error(`Định dạng dữ liệu không hợp lệ từ máy chủ`);
        }
        const pagination = {
          page: pageNum.toString(),
          limit: '10',
          total: totalCount.toString(),
          totalPages: Math.ceil(totalCount / 10).toString()
        };
        
        // Update jobs state
        setJobs(prevJobs => 
          pageNum === 1 ? jobsData : [...prevJobs, ...jobsData]
        );
        
        // Update pagination state
        const hasMoreData = pageNum < Math.ceil(totalCount / 10);
        setHasMore(hasMoreData);
        setCurrentPage(pageNum);
        
        // Show no jobs message if no results on initial load
        if (isInitialLoad) {
          setShowNoJobsMessage(jobsData.length === 0);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra!");
        setShowNoJobsMessage(true);
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  // Initialize debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string, locationValue: string) => {
        setCurrentPage(1);
        setJobs([]);
        setShowNoJobsMessage(false);
        fetchJobs(1, searchValue, locationValue);
      }, 500),
    [fetchJobs]
  );

  // Handle search parameter changes
  useEffect(() => {
    if (jobTitle || province) {
      debouncedSearch(jobTitle, province);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [jobTitle, province, debouncedSearch]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasMore || loading || loadingMore) return;

    const currentObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchJobs(nextPage, jobTitle, province);
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        currentObserver.unobserve(currentRef);
      }
      currentObserver.disconnect();
    };
  }, [fetchJobs, hasMore, jobTitle, loading, loadingMore, currentPage, province]);

  // Initial data fetch
  useEffect(() => {
    isMounted.current = true;
    
    // Only fetch if we don't have any jobs loaded yet
    if (jobs.length === 0) {
      fetchJobs(1, jobTitle, province);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchJobs, jobTitle, jobs.length, province]);

  // Modal ứng tuyển
  const [applyModal, setApplyModal] = useState<{ open: boolean; job: Job | null }>({
    open: false,
    job: null,
  });

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      cv: formData.get("cv") as string,
      message: formData.get("message") as string,
      jobId: applyModal.job?.id,
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Ứng tuyển thất bại!");

      alert("Ứng tuyển thành công!");
      setApplyModal({ open: false, job: null });
      form.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Search summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Kết quả tìm kiếm
        </h1>
        {(jobTitle || province) && (
          <p className="text-gray-600">
            {jobTitle && (
              <span>
                Việc làm: <span className="font-medium">{jobTitle}</span>{" "}
              </span>
            )}
            {province && (
              <span>
                tại <span className="font-medium">{province}</span>
              </span>
            )}
          </p>
        )}
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Đang hiển thị {jobs.length} công việc
          </p>
        )}
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => {
                setError("");
                router.push("/search");
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
        </div>
      ) : showNoJobsMessage ? (
        <div className="text-center py-10">
          <p>Không tìm thấy công việc phù hợp</p>
          <Link
            href="/jobs"
            className="mt-4 inline-block text-blue-600 hover:underline font-semibold"
          >
            Xem tất cả việc làm
          </Link>
        </div>
      ) : (
        <>
          {/* Modal ứng tuyển */}
          {applyModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button
                  className="absolute top-3 right-3 text-gray-500 text-xl hover:text-red-500"
                  onClick={() => setApplyModal({ open: false, job: null })}
                >
                  ×
                </button>
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                  Ứng tuyển: {applyModal.job?.title}
                </h3>
                <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                  <input name="name" placeholder="Họ tên" className="border p-2 rounded" required />
                  <input name="email" placeholder="Email" className="border p-2 rounded" required type="email" />
                  <input name="phone" placeholder="Số điện thoại" className="border p-2 rounded" required />
                  <input name="cv" placeholder="Link CV (nếu có)" className="border p-2 rounded" />
                  <textarea name="message" placeholder="Lời nhắn (tùy chọn)" className="border p-2 rounded h-32" />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Gửi đơn
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Job List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Job Image */}
                  <div className="md:w-1/3 h-48 md:h-auto">
                    {job.img ? (
                      <img
                        src={job.img}
                        alt={job.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${job.img ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <p className="text-sm text-gray-500">Không có hình ảnh</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Job Content */}
                  <div className="md:w-2/3 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {job.company} • {job.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {job.type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {job.salary}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    <button
                      onClick={() => setApplyModal({ open: true, job })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Ứng tuyển ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={loadMoreRef} className="h-10">
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {!loadingMore && jobs.length > 0 && !hasMore && (
              <div className="text-center py-6 text-gray-500">
                Bạn đã xem hết tất cả công việc
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
