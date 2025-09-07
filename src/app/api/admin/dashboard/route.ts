import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [ADMIN DASHBOARD] GET request received');
    
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      console.log('❌ [ADMIN DASHBOARD] Unauthorized access');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [ADMIN DASHBOARD] Admin verified:', admin.username);

    // Sample dashboard stats
    const dashboardStats = {
      overview: {
        totalJobs: 15,
        totalApplications: 42,
        totalHirings: 8,
        totalNews: 12
      },
      jobs: {
        total: 15,
        active: 8,
        pending: 5,
        expired: 2
      },
      applications: {
        total: 42,
        pending: 18,
        approved: 15,
        rejected: 9
      },
      recentActivity: {
        lastUpdated: new Date().toISOString(),
        systemStatus: 'healthy'
      }
    };

    console.log('✅ [ADMIN DASHBOARD] Returning stats:', dashboardStats.overview);
    
    return NextResponse.json({ 
      success: true, 
      data: dashboardStats 
    });
  } catch (err) {
    console.error('💥 [ADMIN DASHBOARD] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

