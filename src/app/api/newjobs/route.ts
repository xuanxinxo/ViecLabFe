import { NextRequest, NextResponse } from 'next/server';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  salary?: string;
  description: string;
  requirements: string[];
  status: string;
  [key: string]: any;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters with proper type conversion and defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const searchQuery = (searchParams.get('search') || '').toLowerCase().trim();
    const locationQuery = (searchParams.get('location') || '').toLowerCase().trim();

    console.log('Search parameters:', { searchQuery, locationQuery, page, limit });
    
    // Call backend API directly to get newjobs data from MongoDB
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchQuery && { search: searchQuery }),
      ...(locationQuery && { location: locationQuery })
    });

    console.log(`Calling backend API: ${backendUrl}/api/newjobs?${queryParams}`);

    const response = await fetch(`${backendUrl}/api/newjobs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const newjobsData = await response.json();
    console.log('Backend response data:', newjobsData);
    
    // Backend returns array directly, we need to wrap it in the expected format
    let jobs = Array.isArray(newjobsData) ? newjobsData : [];
    
    // If no jobs from backend, provide some sample data for testing
    if (jobs.length === 0) {
      console.log('No jobs from backend, providing sample data');
      jobs = [
        {
          _id: 'sample-1',
          title: 'Frontend Developer React',
          company: 'TechCorp Vietnam',
          location: 'Hồ Chí Minh',
          type: 'Full-time',
          salary: '25.000.000 - 35.000.000 VND',
          description: 'Tìm kiếm Frontend Developer có kinh nghiệm với React, TypeScript.',
          requirements: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS'],
          benefits: ['Lương thưởng hấp dẫn', 'Bảo hiểm toàn diện', 'Cơ hội thăng tiến'],
          status: 'active',
          postedDate: new Date().toISOString(),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          img: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'sample-2',
          title: 'Backend Developer Node.js',
          company: 'StartupHub',
          location: 'Hà Nội',
          type: 'Full-time',
          salary: '20.000.000 - 30.000.000 VND',
          description: 'Phát triển backend cho ứng dụng fintech với Node.js và MongoDB.',
          requirements: ['Node.js', 'MongoDB', 'Express', 'REST API'],
          benefits: ['Remote work', 'Learning budget', 'Flexible hours'],
          status: 'active',
          postedDate: new Date().toISOString(),
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          img: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    // Apply client-side filtering if needed (since backend doesn't support it yet)
    let filteredJobs = jobs;
    if (searchQuery || locationQuery) {
      filteredJobs = jobs.filter((job: any) => {
        const matchesSearch = !searchQuery || 
          job.title?.toLowerCase().includes(searchQuery) ||
          job.description?.toLowerCase().includes(searchQuery) ||
          job.company?.toLowerCase().includes(searchQuery);
          
        const matchesLocation = !locationQuery || 
          (job.location && job.location.toLowerCase().includes(locationQuery));
          
        return matchesSearch && matchesLocation;
      });
    }
    
    // Apply pagination
    const totalJobs = filteredJobs.length;
    const totalPages = Math.ceil(totalJobs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: totalJobs,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching newjobs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
