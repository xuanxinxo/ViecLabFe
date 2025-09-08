'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface StatsData {
  totalJobs: number;
  totalApplications: number;
  totalNews: number;
  totalHirings: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    totalJobs: 0,
    totalApplications: 0,
    totalNews: 0,
    totalHirings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        const [jobsResponse, newsResponse, applicationsResponse, hiringsResponse] = await Promise.allSettled([
          apiClient.jobs.getAll({}),
          apiClient.news.getAll({}),
          apiClient.applications.getAll({}),
          apiClient.hirings.getAll({})
        ]);
        
        const jobs = jobsResponse.status === 'fulfilled' ? ((jobsResponse.value as any).data || []) : [];
        const news = newsResponse.status === 'fulfilled' ? ((newsResponse.value as any).data || []) : [];
        const applications = applicationsResponse.status === 'fulfilled' ? ((applicationsResponse.value as any).data || []) : [];
        const hirings = hiringsResponse.status === 'fulfilled' ? ((hiringsResponse.value as any).data || []) : [];
        
        setStats({
          totalJobs: jobs.length,
          totalApplications: applications.length,
          totalNews: news.length,
          totalHirings: hirings.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Đang tải thống kê...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Thống kê TOREDCO
          </h2>
          <p className="text-xl text-blue-100">
            Dữ liệu thực tế từ hệ thống
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {stats.totalJobs + stats.totalHirings}
            </div>
            <div className="text-blue-100 text-lg">
              Việc làm
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {stats.totalApplications}
            </div>
            <div className="text-blue-100 text-lg">
              Ứng viên
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {stats.totalNews}
            </div>
            <div className="text-blue-100 text-lg">
              Tin tức
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {stats.totalHirings}
            </div>
            <div className="text-blue-100 text-lg">
              Tuyển dụng
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
