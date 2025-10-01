'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Job } from "@/src/types/job";
import ApplyModal from "./ApplyModal";
import JobCard from "./JobCard";
import PaginationDots from "./PaginationDots";
// Removed apiClient and apiLoaders imports - using direct fetch instead

// ApplyModal extracted to its own file

export default function CarouselJob() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true); // Show loading initially
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const [currentPage, setCurrentPage] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Prevent multiple initial calls
  const router = useRouter();

  const jobsPerPage = 6; // 6 jobs per page, 2 pages = 12 total jobs
  const bgImages = ['/img/slide-1.png', '/img/slide-2.png'];

  const fetchJobs = async (isRetry: boolean = false) => {
    try {
      // Only show loading on initial load, not on retries
      if (!isRetry) {
        setLoading(true);
      }
      
      console.log('🔍 [CAROUSEL JOB COMPONENT] Fetching jobs from backend API...', isRetry ? '(Retry)' : '(Initial)');
      
      // Call jobs API directly
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '12');
      queryParams.append('page', '1');
      const url = `/api/jobs?${queryParams.toString()}`;
      console.log('🔍 [CAROUSEL JOB COMPONENT] API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('🔍 [CAROUSEL JOB COMPONENT] API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 [CAROUSEL JOB COMPONENT] API Response data:', data);
      
      // Handle different response formats
      let jobsData: Job[] = [];
      if (data.success && data.data) {
        // Handle response format: { success: true, data: { items: [...], pagination: {...} } }
        if (data.data.items && Array.isArray(data.data.items)) {
          jobsData = data.data.items;
          console.log('✅ [CAROUSEL JOB COMPONENT] Using data.data.items with', jobsData.length, 'jobs');
        } else if (Array.isArray(data.data)) {
          jobsData = data.data;
          console.log('✅ [CAROUSEL JOB COMPONENT] Using data.data with', jobsData.length, 'jobs');
        } else {
          console.log('❌ [CAROUSEL JOB COMPONENT] No valid jobs data found in response');
          jobsData = [];
        }
      } else if (Array.isArray(data)) {
        // Direct array response
        jobsData = data;
        console.log('✅ [CAROUSEL JOB COMPONENT] Using direct array with', jobsData.length, 'jobs');
      } else {
        console.error("❌ [CAROUSEL JOB COMPONENT] Unexpected response format:", data);
        throw new Error("Invalid response format");
      }
      
      // Format jobs data
      const formattedJobs = jobsData.map((job: any) => ({
        id: job.id || job._id || '',
        title: job.title || 'No Title',
        company: job.company || 'No Company',
        location: job.location || 'Remote',
        type: job.type || 'Full-time',
        salary: job.salary || 'Negotiable',
        description: job.description || 'No description available',
        postedDate: job.createdAt || job.postedDate || new Date().toISOString(),
        img: job.img || '',
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        status: job.status || 'active',
        isRemote: job.isRemote || false,
        tags: job.tags || []
      }));
      
      console.log("✅ [CAROUSEL JOB COMPONENT] Formatted jobs:", formattedJobs);
      
      // Sort by date (newest first) and limit to 12 jobs (6 per page × 2 pages)
      const sortedJobs = [...formattedJobs]
        .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        .slice(0, 12);
      
      console.log('Sorted and limited to 12 jobs:', sortedJobs.length);
      
      setJobs(sortedJobs);
      setRetryCount(0); // Reset retry count on success
      setLoading(false); // Always stop loading when data is loaded
      setIsInitialized(true); // Mark as initialized
      
    } catch (error: any) {
      console.error('💥 [CAROUSEL JOB COMPONENT] Error loading jobs:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error('💥 [CAROUSEL JOB COMPONENT] Timeout error');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.error('💥 [CAROUSEL JOB COMPONENT] Network error');
      } else if (error.message?.includes('404')) {
        console.error('💥 [CAROUSEL JOB COMPONENT] 404 error');
      } else {
        console.error('💥 [CAROUSEL JOB COMPONENT] Other error:', error.message);
      }
      
      // Retry up to 2 times only
      if (retryCount < 2) {
        console.log(`🔄 [CAROUSEL JOB COMPONENT] Retrying... attempt ${retryCount + 1}/2`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchJobs(true); // Pass isRetry = true
        }, 2000); // Wait 2 seconds before retry
      } else {
        console.log('🔄 [CAROUSEL JOB COMPONENT] Max retries reached, using fallback data');
        // Use fallback data instead of empty array
        const fallbackJobs = [
          {
            id: 'fallback-1',
            title: 'Frontend Developer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '15-20 triệu',
            description: 'Phát triển ứng dụng web với React, Next.js',
            requirements: ['React', 'TypeScript', 'Next.js'],
            benefits: ['Lương thưởng hấp dẫn', 'Bảo hiểm y tế'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/tech.jpg'
          },
          {
            id: 'fallback-2',
            title: 'Backend Developer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '18-25 triệu',
            description: 'Phát triển API và hệ thống backend',
            requirements: ['Node.js', 'MongoDB', 'Express'],
            benefits: ['Stock options', 'Remote work'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/backend.jpg'
          },
          {
            id: 'fallback-3',
            title: 'UI/UX Designer',
            company: 'TOREDCO',
            location: 'Đà Nẵng',
            type: 'Full-time',
            salary: '12-18 triệu',
            description: 'Thiết kế giao diện người dùng',
            requirements: ['Figma', 'Adobe Creative Suite'],
            benefits: ['Môi trường sáng tạo', 'Đào tạo'],
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            img: '/img/design.jpg'
          }
        ];
        setJobs(fallbackJobs);
        setLoading(false);
        setIsInitialized(true); // Mark as initialized even with fallback
      }
    }
  };

  useEffect(() => {
    // Only fetch jobs once on component mount
    if (!isInitialized) {
      // Clear any cached mock data and fetch fresh data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cachedJobs');
        console.log('Cleared cached jobs from localStorage');
      }
      fetchJobs();
    }
  }, [isInitialized]);

  // Show loading when loading is true
  const shouldShowLoading = loading;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % 2);
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyJob = (job: Job) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/)?.[1] ?? '')
      : '';
    if (!token) {
      alert('Bạn cần đăng nhập để ứng tuyển!');
      router.push('/login');
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  if (shouldShowLoading) {
    return (
      <div className="w-full mt-14">
        <div className="text-center py-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="w-full mt-14">
        <div className="text-center py-10 text-gray-500">
          <p>Hiện chưa có việc làm nào.</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setIsInitialized(false);
              fetchJobs();
            }}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const currentJobs = jobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);

  return (
    <div className="w-full bg-gray-50 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 opacity-20 blur-sm"
        style={{ backgroundImage: `url(${bgImages[currentPage]})` }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Việc làm nổi bật</h2>
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1}/2 • {jobs.length} việc làm
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApplyJob} />
            ))}
          </div>

          {/* Pagination Dots */}
          <PaginationDots total={2} current={currentPage} onChange={setCurrentPage} />

          {/* View More */}
          <div className="flex justify-center mt-8">
            <Link href="/jobs" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Xem thêm việc làm →
            </Link>
          </div>
        </div>
      </div>

      <ApplyModal open={showApplyModal} onClose={() => setShowApplyModal(false)} job={selectedJob} />
    </div>
  );
}
