"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types/job";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline?: string;
  status: string;
  postedDate: string;
  img?: string;
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 text-xl hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          Ứng tuyển: {job?.title}
        </h3>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <input name="name" placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" placeholder="Email" className="border p-2 rounded" required type="email" />
          <input name="phone" placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" placeholder="Link CV (nếu có)" className="border p-2 rounded" />
          <textarea name="message" placeholder="Tin nhắn" className="border p-2 rounded" rows={4} />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-semibold hover:shadow-lg transition-all"
          >
            Gửi đơn ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

function FilteredJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [applyModal, setApplyModal] = useState<{ open: boolean; job: Job | null }>({ open: false, job: null });
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchJobs = async () => {
    try {
      const location = searchParams.get('location');
      const type = searchParams.get('type');
      const pageParam = parseInt(searchParams.get('page') || '1');
      const limit = 10;
      
      const queryParams = new URLSearchParams();
      if (location) queryParams.set('location', location);
      if (type) queryParams.set('type', type);
      queryParams.set('page', page.toString());

      // Fetch from all three APIs
      const [jobsRes, newjobsRes, hringsRes] = await Promise.all([
        fetch(`/api/jobs?${queryParams.toString()}`),
        fetch(`/api/newjobs?${queryParams.toString()}`),
        fetch(`/api/hrings?${queryParams.toString()}`)
      ]);

      const [jobsData, newjobsResData, hringsData] = await Promise.all([
        jobsRes.json(),
        newjobsRes.json(),
        hringsRes.json()
      ]);

      // Combine results from all APIs
      let combinedJobs = [...jobsData.jobs, ...newjobsResData.jobs, ...hringsData.jobs];
      
      // Filter by location if specified
      if (location) {
        const normalizeString = (str: string) => 
          str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        
        combinedJobs = combinedJobs.filter(job => 
          normalizeString(job.location).includes(normalizeString(location))
        );
      }

      // Filter by type if specified
      if (type) {
        combinedJobs = combinedJobs.filter(job => job.type.toLowerCase() === type.toLowerCase());
      }

      // Sort combined results by posted date (newest first)
      combinedJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

      // Calculate pagination
      const totalPages = Math.ceil(combinedJobs.length / limit);
      const currentPage = pageParam;
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      const paginatedJobs = combinedJobs.slice(start, end);

      setJobs(paginatedJobs);
      setTotalJobs(combinedJobs.length);
      setPage(currentPage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleApply = (job: Job) => {
    setApplyModal({ open: true, job });
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = {
      name: (form.name as any).value,
      email: (form.email as any).value,
      phone: (form.phone as any).value,
      cv: (form.cv as any).value,
      message: (form.message as any).value,
      jobId: applyModal.job.id,
    };
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const responseData = await res.json();
    console.log('Application response:', responseData);
    
    // Handle nested response structure
    const isSuccess = responseData.success && (responseData.data?.success !== false);
    if (isSuccess) {
      alert("Ứng tuyển thành công!");
      setApplyModal({ open: false, job: null });
    } else {
      alert("Ứng tuyển thất bại!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Danh sách việc làm</h1>
              <p className="text-gray-600">
                {totalJobs} việc làm được tìm thấy
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded font-semibold hover:shadow-lg transition-all"
            >
              Quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.company}</p>
                    <p className="text-gray-500 mb-2">{job.location}</p>
                    <p className="text-green-600 mb-2">{job.salary}</p>
                    <p className="text-gray-500 mb-4">Ngày đăng: {new Date(job.postedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded font-semibold hover:shadow-lg transition-all mb-2"
                      onClick={() => handleApply(job)}
                    >
                      Ứng tuyển
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Math.ceil(totalJobs / 10) > 1 && (
            <div className="flex justify-center mt-8">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded font-semibold hover:shadow-lg transition-all"
                onClick={() => setPage(prev => prev - 1)}
                disabled={page === 1}
              >
                Trang trước
              </button>
              <span className="mx-4 text-gray-600">Trang {page}</span>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded font-semibold hover:shadow-lg transition-all"
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= Math.ceil(totalJobs / 10)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      <ApplyModal
        open={applyModal.open}
        onClose={() => setApplyModal({ open: false, job: null })}
        onSubmit={handleApplySubmit}
        job={applyModal.job}
      />
    </div>
  );
}

export default FilteredJobsPage;
