"use client";
import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { apiLoaders } from "../../lib/apiDataLoader";

interface JobNew {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  status: string;
  postedDate?: string;
  deadline?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  img?: string | null;
}

export default function HiringsJobNewList() {
  const [jobs, setJobs] = useState<JobNew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");
      console.log('🔍 [HIRINGS] Fetching hirings data...');

      const result = await apiLoaders.hirings.load({ status: 'approved' });

      if (result.success) {
        console.log(`✅ [HIRINGS] Loaded ${result.data.length} hirings successfully`);
        setJobs(result.data);
      } else {
        console.error('❌ [HIRINGS] Failed to load hirings:', result.error);
        setError(result.error || "Định dạng dữ liệu không hợp lệ từ máy chủ");
      }
    } catch (err) {
      console.error('💥 [HIRINGS] Error loading hirings:', err);
      setError(`Có lỗi xảy ra khi tải dữ liệu: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  // Format ngày (dd/mm/yyyy)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Group jobs theo công ty
  const groupedJobs = jobs.reduce((acc: Record<string, JobNew[]>, job) => {
    if (!acc[job.company]) acc[job.company] = [];
    acc[job.company].push(job);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 pt-20">
      <header className="bg-white shadow-sm border-b mb-8 fixed top-0 left-0 right-0 z-50">
      </header>
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 mt-10">
        <a
          href="/"
          className="mr-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors"
        >
          ← Quay lại
        </a>
        <h1 className="text-2xl font-bold text-blue-700">
          Danh sách việc làm mới
        </h1>
      </div>
      <main className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-blue-600">Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium">{error}</p>
            </div>
            <button
              onClick={loadJobs}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <p className="text-lg">Không có việc làm mới nào.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(groupedJobs)
                .slice(0, visibleCount)
                .map(([company, companyJobs]) => (
                  <div
                    key={company}
                    className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
                  >
                    {/* Header công ty */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        {/* Logo */}
                        <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-50 border overflow-hidden">
                          {companyJobs[0]?.img ? (
                            <img
                              src={companyJobs[0].img}
                              alt="Company logo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${companyJobs[0]?.img ? 'hidden' : ''}`}>
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-gray-800">
                            {company}
                          </h2>
                          <div className="flex items-center text-sm text-gray-600 gap-1">
                            <MapPin size={14} />
                            {companyJobs[0]?.location}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Lĩnh vực:{" "}
                            <span className="font-medium">
                              {companyJobs[0]?.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Danh sách job */}
                    <div className="space-y-3">
                      {companyJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border flex flex-col md:flex-row justify-between md:items-center gap-3"
                        >
                          <div>
                            <p className="text-blue-600 font-medium text-sm">
                              {job.title}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                              <span className="text-green-600 font-medium">
                                {job.salary || "Thỏa thuận"}
                              </span>
                              {job.deadline && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{formatDate(job.deadline)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Nút hành động */}
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-sm font-semibold shadow hover:from-green-600 hover:to-blue-600 transition-colors">
                              Ứng tuyển job
                            </button>
                            <a
                              href={`/jobs/${job.id}`}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold shadow hover:bg-gray-300 transition-colors"
                            >
                              Xem chi tiết
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Xem thêm */}
            {visibleCount < Object.keys(groupedJobs).length && (
              <div className="flex justify-center mt-8">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
                  onClick={() => setVisibleCount((v) => v + 2)}
                >
                  Xem thêm công ty
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
