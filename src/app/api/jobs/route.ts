import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// GET /api/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [JOBS API] GET request received');
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
    const locationQuery = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || searchParams.get('_page') || '1');
    const limit = parseInt(searchParams.get('limit') || searchParams.get('_limit') || '10');
    
    console.log('Search parameters:', { searchQuery, locationQuery, page, limit });
    
    // Call backend API directly - hardcode URL to ensure it works
    const backendUrl = 'https://vieclabbe.onrender.com';
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchQuery && { search: searchQuery }),
      ...(locationQuery && { location: locationQuery })
    });

    console.log(`Calling backend API: ${backendUrl}/api/jobs?${queryParams}`);

    const response = await fetch(`${backendUrl}/api/jobs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend API error: ${response.status} - ${errorText}`,
          data: [],
          count: 0
        },
        { status: response.status }
      );
    }

    // Backend API successful
    const backendData = await response.json();
    console.log('Backend response data:', backendData);
    
    // Handle different backend response formats
    let jobsData = [];
    if (Array.isArray(backendData)) {
      jobsData = backendData;
    } else if (backendData.data && Array.isArray(backendData.data)) {
      jobsData = backendData.data;
    } else if (backendData.jobs && Array.isArray(backendData.jobs)) {
      jobsData = backendData.jobs;
    } else {
      console.error('Unexpected backend response format:', backendData);
      jobsData = [];
    }

    // Client-side filtering if backend doesn't filter properly
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      console.log('Applying client-side search filter for:', searchTerm);
      
      jobsData = jobsData.filter((job: any) => {
        const title = (job.title || '').toLowerCase();
        const company = (job.company || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        const location = (job.location || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               company.includes(searchTerm) || 
               description.includes(searchTerm) ||
               location.includes(searchTerm);
      });
      
      console.log(`Filtered results: ${jobsData.length} jobs match "${searchTerm}"`);
    }

    // Client-side location filtering
    if (locationQuery && locationQuery.trim()) {
      const locationTerm = locationQuery.toLowerCase().trim();
      console.log('Applying client-side location filter for:', locationTerm);
      
      jobsData = jobsData.filter((job: any) => {
        const location = (job.location || '').toLowerCase();
        return location.includes(locationTerm);
      });
      
      console.log(`Location filtered results: ${jobsData.length} jobs in "${locationTerm}"`);
    }

    return NextResponse.json({
      success: true,
      data: jobsData,
      count: jobsData.length,
      pagination: backendData.pagination || {}
    });
  } catch (err) {
    console.error('💥 [JOBS API] Error:', err);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      benefits,
      deadline,
      image,
    } = await req.json();

    // Validate required fields
    if (!title || !company || !location || !type || !salary || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new job using the API client
    // const response = await apiClient.jobs.create({
    //   title,
    //   company,
    //   location,
    //   type,
    //   salary: salary || null,
    //   description,
    //   requirements: requirements || [],
    //   benefits: benefits || [],
    //   image: image || null,
    //   status: 'pending',
    // });
    
    // const job = response.data;
    // return NextResponse.json(job, { status: 201 });
    return NextResponse.json({ message: 'POST endpoint is not implemented yet' }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}