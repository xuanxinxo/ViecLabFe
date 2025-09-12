import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
export const dynamic = "force-dynamic";
// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN DASHBOARD] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN DASHBOARD] Unauthorized access');
      const response = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return addCorsHeaders(response);
    }

    console.log('✅ [ADMIN DASHBOARD] Admin verified:', admin.username);

    // Fetch real data from backend APIs
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    
    try {
      // Fetch all data in parallel
      const [jobsResponse, applicationsResponse, hiringsResponse, newsResponse] = await Promise.allSettled([
        fetch(`${backendUrl}/api/jobs`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(`${backendUrl}/api/applications`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(`${backendUrl}/api/hirings`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(`${backendUrl}/api/news`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      ]);

      // Process jobs data
      let jobs = [];
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.ok) {
        const jobsData = await jobsResponse.value.json();
        jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || []);
      }

      // Process applications data
      let applications = [];
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
        const applicationsData = await applicationsResponse.value.json();
        applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData.data || []);
      }

      // Process hirings data
      let hirings = [];
      if (hiringsResponse.status === 'fulfilled' && hiringsResponse.value.ok) {
        const hiringsData = await hiringsResponse.value.json();
        hirings = Array.isArray(hiringsData) ? hiringsData : (hiringsData.data || []);
      }

      // Process news data
      let news = [];
      if (newsResponse.status === 'fulfilled' && newsResponse.value.ok) {
        const newsData = await newsResponse.value.json();
        news = Array.isArray(newsData) ? newsData : (newsData.data || []);
      }

      // Calculate stats
      const totalJobs = jobs.length + hirings.length;
      const activeJobs = jobs.filter((job: any) => job.status === 'active' || job.status === 'published').length;
      const pendingJobs = jobs.filter((job: any) => job.status === 'pending' || job.status === 'draft').length;
      const expiredJobs = jobs.filter((job: any) => job.status === 'expired').length;

      const pendingApplications = applications.filter((app: any) => app.status === 'pending').length;
      const approvedApplications = applications.filter((app: any) => app.status === 'approved').length;
      const rejectedApplications = applications.filter((app: any) => app.status === 'rejected').length;

      const dashboardStats = {
        overview: {
          totalJobs,
          totalApplications: applications.length,
          totalHirings: hirings.length,
          totalNews: news.length
        },
        jobs: {
          total: jobs.length,
          active: activeJobs,
          pending: pendingJobs,
          expired: expiredJobs
        },
        applications: {
          total: applications.length,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications
        },
        recentActivity: {
          lastUpdated: new Date().toISOString(),
          systemStatus: 'healthy'
        }
      };

      console.log('✅ [ADMIN DASHBOARD] Real data loaded:', dashboardStats.overview);
      
      const response = NextResponse.json({ 
        success: true, 
        data: dashboardStats 
      });
    return addCorsHeaders(response);

    } catch (apiError) {
      console.error('💥 [ADMIN DASHBOARD] Backend API error:', apiError);
      
      // Fallback to sample data if backend is not available
      const dashboardStats = {
        overview: {
          totalJobs: 0,
          totalApplications: 0,
          totalHirings: 0,
          totalNews: 0
        },
        jobs: {
          total: 0,
          active: 0,
          pending: 0,
          expired: 0
        },
        applications: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        },
        recentActivity: {
          lastUpdated: new Date().toISOString(),
          systemStatus: 'backend_unavailable'
        }
      };

      console.log('⚠️ [ADMIN DASHBOARD] Using fallback data due to backend unavailability');
      
      const response = NextResponse.json({ 
        success: true, 
        data: dashboardStats 
      });
    return addCorsHeaders(response);
    }
  } catch (err) {
    console.error('💥 [ADMIN DASHBOARD] Error:', err);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

