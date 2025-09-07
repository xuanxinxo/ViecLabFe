"use client";
import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";

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
      const res = await fetch("/api/hirings?status=approved");
      const json = await res.json();
      if (Array.isArray(json.data)) {
        setJobs(json.data);
      } else {
        setError("Không thể tải danh sách việc làm mới");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
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
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
          <a
            href="/"
            className="mr-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors"
          >
            ← Quay lại
          </a>
          <h1 className="text-2xl font-bold text-blue-700">
            Danh sách việc làm mới (Good)
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="text-center text-lg text-blue-600">Đang tải...</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-500">
            Không có việc làm mới nào.
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
                        <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-50 border">
                          <img
                            src={companyJobs[0]?.img || "/placeholder.png"}
                            alt="Company logo"
                            className="w-12 h-12 object-contain"
                          />
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
