"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from '../../lib/api';
import { adminApi } from '../../lib/backendApi';
import ApiStatus from '../../components/ui/ApiStatus';
import { getFeaturedNews, NewsItem } from '../../lib/api/news';
import { getFeaturedApplications, Application } from '../../lib/api/applications';
import { getReviews, Review } from '../../lib/api/reviews';

interface DashboardStats {
  totalJobs: number;
  totalFreelancers: number;
  totalReviews: number;
  activeJobs: number;
  pendingJobs: number;
  totalApplications: number;
  totalNews: number;
}

interface HomeData {
  hirings: any[];
  newJobs: any[];
  jobs: any[];
  applications: Application[];
  news: NewsItem[];
  reviews: Review[];
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
  const [homeData, setHomeData] = useState<HomeData>({
    hirings: [],
    newJobs: [],
    jobs: [],
    applications: [],
    news: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  // Hard guard: verify admin token with protected API; redirect to login if unauthorized
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.status === 401) {
          router.push('/admin/login?redirect=/admin');
          return;
        }
      } catch (_) {
        router.push('/admin/login?redirect=/admin');
        return;
      }
    };
    verifyAdmin();
  }, [router]);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        
        console.log("Loading dashboard stats...");
        
        // Fetch stats from public APIs instead of admin dashboard
        const response = await fetch('/api/jobs', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Jobs data loaded successfully:", data);
          // Skip admin dashboard logic, go directly to fallback method
          throw new Error('Using fallback method with public APIs');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        
        // Fallback: Try to fetch individual data from backend directly
        try {
          console.log("Trying fallback method with backend API...");
          const [jobsData, newsData, applicationsData, hiringsData, newJobsData] = await Promise.allSettled([
            adminApi.jobs.getAll(),
            adminApi.news.getAll(),
            adminApi.applications.getAll(),
            adminApi.hirings.getAll(),
            adminApi.newJobs.getAll()
          ]);
          
          const jobs = jobsData.status === 'fulfilled' && jobsData.value?.data?.items 
            ? jobsData.value.data.items : [];
          const news = newsData.status === 'fulfilled' && newsData.value?.data?.items 
            ? newsData.value.data.items : [];
          const applications = applicationsData.status === 'fulfilled' && applicationsData.value?.data?.items 
            ? applicationsData.value.data.items : [];
          const hirings = hiringsData.status === 'fulfilled' && hiringsData.value?.data?.items 
            ? hiringsData.value.data.items : [];
          const newJobs = newJobsData.status === 'fulfilled' && newJobsData.value?.data?.items 
            ? newJobsData.value.data.items : [];
          
          console.log("Backend data loaded:", { 
            jobs: jobs.length, 
            news: news.length, 
            applications: applications.length, 
            hirings: hirings.length,
            newJobs: newJobs.length
          });
          
          // Tính toán chính xác các số liệu theo yêu cầu
          const activeJobs = jobs.filter((job: any) => job.status === 'active' || job.status === 'published').length;
          const pendingJobs = jobs.filter((job: any) => job.status === 'pending' || job.status === 'draft').length;
          
          // Tổng việc làm = jobs + hirings + newJobs (không trùng lặp)
          const totalJobCount = jobs.length + hirings.length + newJobs.length;
          
          // Tính tổng reviews từ dữ liệu thực tế
          const totalReviewsCount = 0; // Sẽ được cập nhật khi có API reviews
          
          setStats({
            totalJobs: totalJobCount,
            totalFreelancers: applications.length,
            totalReviews: totalReviewsCount,
            activeJobs,
            pendingJobs,
            totalApplications: applications.length,
            totalNews: news.length,
          });
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
          setStats({
            totalJobs: 0,
            totalFreelancers: 0,
            totalReviews: 0,
            activeJobs: 0,
            pendingJobs: 0,
            totalApplications: 0,
            totalNews: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const loadHomeData = async () => {
      try {
        setDataLoading(true);
        console.log("Loading home data (similar to home page)...");
        
        // Load all data similar to home page
        const [hiringsData, newJobsData, jobsData, applicationsData, newsData, reviewsData] = await Promise.allSettled([
          apiClient.hirings.getAll({}),
          apiClient.newJobs.getAll({ limit: 4, page: 1 }),
          apiClient.jobs.getAll({}),
          getFeaturedApplications(8),
          getFeaturedNews(4, Date.now()),
          getReviews({ limit: 20, status: 'approved' })
        ]);

        const hirings = hiringsData.status === 'fulfilled' && hiringsData.value?.data 
          ? hiringsData.value.data : [];
        const newJobs = newJobsData.status === 'fulfilled' && newJobsData.value?.data 
          ? newJobsData.value.data : [];
        const jobs = jobsData.status === 'fulfilled' && jobsData.value?.data 
          ? jobsData.value.data : [];
        const applications = applicationsData.status === 'fulfilled' 
          ? applicationsData.value : [];
        const news = newsData.status === 'fulfilled' 
          ? newsData.value : [];
        const reviews = reviewsData.status === 'fulfilled' && reviewsData.value?.data
          ? reviewsData.value.data : [];

        console.log("Home data loaded:", { 
          hirings: hirings.length, 
          newJobs: newJobs.length, 
          jobs: jobs.length,
          applications: applications.length, 
          news: news.length,
          reviews: reviews.length
        });

        setHomeData({
          hirings,
          newJobs,
          jobs,
          applications,
          news,
          reviews
        });

        // Cập nhật stats từ dữ liệu thực tế nếu dashboard API không hoạt động
        if (stats.totalJobs === 0) {
          const totalJobCount = hirings.length + newJobs.length + jobs.length;
          const totalReviewsCount = reviews.length;
          
          setStats(prevStats => ({
            ...prevStats,
            totalJobs: totalJobCount,
            totalReviews: totalReviewsCount,
            totalApplications: applications.length,
            totalNews: news.length,
          }));
        }
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboardStats();
    loadHomeData();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear admin token from cookies
      document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if logout fails
      router.push("/admin/login");
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">
            {loading ? 'Đang tải dữ liệu dashboard...' : 'Đang tải dữ liệu trang chủ...'}
          </div>
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
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid stats={stats} homeData={homeData} />

        <QuickActions />

        <DataOverview homeData={homeData} />

        {/* Home Data Sections - Similar to Home Page */}
        <div className="space-y-8">
          <SectionCard title={`Việc làm Jobs (${homeData.jobs.length})`} href="/admin/jobs">
            {homeData.jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeData.jobs.slice(0, 6).map((job: any) => (
                  <div key={job._id || job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">🏢 {job.company}</p>
                    {job.location && <p className="text-sm text-gray-600 mb-2">📍 {job.location}</p>}
                    {job.salary && <p className="text-sm text-green-600 font-medium">💰 {job.salary}</p>}
                    {job.status && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'active' || job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'pending' || job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {job.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có việc làm Jobs nào</p>
            )}
          </SectionCard>

          {/* Hirings Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Việc làm Hiring ({homeData.hirings.length})
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Tổng: {stats.totalJobs} việc làm)
                </span>
              </h2>
              <Link href="/admin/hirings" className="text-blue-600 hover:text-blue-800">
                Xem tất cả →
              </Link>
            </div>
            {homeData.hirings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeData.hirings.slice(0, 6).map((hiring: any) => (
                  <div key={hiring._id || hiring.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{hiring.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">🏢 {hiring.company}</p>
                    {hiring.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {hiring.location}</p>
                    )}
                    {hiring.salary && (
                      <p className="text-sm text-green-600 font-medium">💰 {hiring.salary}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có việc làm hiring nào</p>
            )}
          </div>

          {/* New Jobs Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Việc làm NewJobs ({homeData.newJobs.length})</h2>
              <Link href="/admin/newjobs" className="text-blue-600 hover:text-blue-800">
                Xem tất cả →
              </Link>
            </div>
            {homeData.newJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeData.newJobs.slice(0, 4).map((job: any) => (
                  <div key={job._id || job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">🏢 {job.company}</p>
                    {job.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {job.location}</p>
                    )}
                    {job.salary && (
                      <p className="text-sm text-green-600 font-medium">💰 {job.salary}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có việc làm newJobs nào</p>
            )}
          </div>


          {/* News Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tin tức mới nhất ({homeData.news.length})</h2>
              <Link href="/admin/news" className="text-blue-600 hover:text-blue-800">
                Xem tất cả →
              </Link>
            </div>
            {homeData.news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeData.news.slice(0, 4).map((news: NewsItem) => (
                  <div key={news._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {news.image && (
                      <div className="h-32 bg-gray-200 relative">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
                      {news.content && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {news.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có tin tức nào</p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Đánh giá mới nhất ({homeData.reviews.length})</h2>
              <Link href="/reviews" className="text-blue-600 hover:text-blue-800">
                Xem tất cả →
              </Link>
            </div>
            {homeData.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeData.reviews.slice(0, 6).map((review: Review) => (
                  <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={review.avatar || '/img/ava.jpg'}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.name}</h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        review.category === 'talent' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {review.category === 'talent' ? '👥 Nhân sự' : '🏢 Doanh nghiệp'}
                      </span>
                    </div>
                    {review.content && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {review.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      📅 {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="bg-white shadow-sm border-b mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TOREDCO Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ApiStatus />
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" title="Làm mới dữ liệu">🔄 Làm mới</button>
            <span className="text-gray-600">Admin</span>
            <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Đăng xuất</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatsCard({ iconBg, icon, label, value, extra }: { iconBg: string; icon: React.ReactNode; label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 ${iconBg} rounded-lg`}>{icon}</div>
        <div className="ml-3">
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
          {extra}
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats, homeData }: { stats: DashboardStats; homeData: HomeData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <StatsCard
        iconBg="bg-blue-100"
        icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>}
        label="Tổng việc làm"
        value={stats.totalJobs || (homeData.hirings.length + homeData.newJobs.length + homeData.jobs.length)}
        extra={<p className="text-xs text-gray-500">(Jobs: {homeData.jobs.length}, Hiring: {homeData.hirings.length}, NewJobs: {homeData.newJobs.length})</p>}
      />
      <StatsCard
        iconBg="bg-green-100"
        icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
        label="Ứng viên"
        value={stats.totalApplications || homeData.applications.length}
      />
      <StatsCard
        iconBg="bg-yellow-100"
        icon={<svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        label="Đánh giá"
        value={stats.totalReviews || homeData.reviews.length}
      />
      <StatsCard
        iconBg="bg-green-100"
        icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        label="Việc làm đang hoạt động"
        value={stats.activeJobs}
      />
      <StatsCard
        iconBg="bg-orange-100"
        icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        label="Chờ duyệt"
        value={stats.pendingJobs}
      />
      <StatsCard
        iconBg="bg-indigo-100"
        icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        label="Tin tức"
        value={stats.totalNews || homeData.news.length}
      />
    </div>
  );
}

function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <Link href="/admin/jobs/create" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-blue-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Đăng việc làm</h3>
          <p className="text-xs text-gray-600">Tạo việc làm mới</p>
        </div>
      </Link>
      <Link href="/admin/jobnew/create" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-green-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Đăng việc làm TopNew</h3>
          <p className="text-xs text-gray-600">Tạo việc làm mới</p>
        </div>
      </Link>
      <Link href="/admin/jobs" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-blue-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Quản lý việc làm</h3>
          <p className="text-xs text-gray-600">Xem và chỉnh sửa</p>
        </div>
      </Link>
      <Link href="/admin/newjobs" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-purple-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Quản lý NewJobs</h3>
          <p className="text-xs text-gray-600">Xem và quản lý</p>
        </div>
      </Link>
      <Link href="/admin/hirings" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-yellow-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Quản lý JobNew</h3>
          <p className="text-xs text-gray-600">Xem và chỉnh sửa</p>
        </div>
      </Link>
      <Link href="/admin/applications" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-indigo-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Quản lý ứng viên</h3>
          <p className="text-xs text-gray-600">Xem và quản lý ứng viên</p>
        </div>
      </Link>
      <Link href="/admin/news" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-indigo-100 rounded-lg mb-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Đăng tin tức</h3>
          <p className="text-xs text-gray-600">Xem tin tức</p>
        </div>
      </Link>
    </div>
  );
}

function DataOverview({ homeData }: { homeData: HomeData }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan dữ liệu hệ thống</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <div className="text-3xl font-bold text-indigo-600">{homeData.jobs.length}</div>
          <div className="text-sm text-gray-600">Việc làm Jobs</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{homeData.hirings.length}</div>
          <div className="text-sm text-gray-600">Việc làm Hiring</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{homeData.newJobs.length}</div>
          <div className="text-sm text-gray-600">Việc làm NewJobs</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{homeData.applications.length}</div>
          <div className="text-sm text-gray-600">Ứng viên</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{homeData.news.length}</div>
          <div className="text-sm text-gray-600">Tin tức</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-700">
          Tổng việc làm: <span className="text-blue-600">{homeData.jobs.length + homeData.hirings.length + homeData.newJobs.length}</span>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, href, children }: { title: string; subtitle?: string; href: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {title} {subtitle && <span className="text-sm font-normal text-gray-500 ml-2">{subtitle}</span>}
        </h2>
        <Link href={href} className="text-blue-600 hover:text-blue-800">Xem tất cả →</Link>
      </div>
      {children}
    </div>
  );
}
