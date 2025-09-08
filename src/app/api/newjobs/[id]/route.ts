import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' }, 
        { status: 400 }
      );
    }

    // Call backend API directly to get newjob data from MongoDB
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com').replace(/\/+$/, '');
    
    let jobData = null;
    
    try {
      const response = await fetch(`${backendUrl}/api/newjobs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        jobData = await response.json();
        console.log('Backend job data:', jobData);
      } else {
        console.warn(`Backend API error: ${response.status}, trying to find job in list`);
      }
    } catch (fetchError) {
      console.warn('Backend API not accessible, trying to find job in list:', fetchError);
    }
    
    // If backend single job API doesn't work, try to find job in the list
    if (!jobData) {
      try {
        const listResponse = await fetch(`${backendUrl}/api/newjobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });
        
        if (listResponse.ok) {
          const jobsList = await listResponse.json();
          const jobs = Array.isArray(jobsList) ? jobsList : [];
          jobData = jobs.find((job: any) => job.id === id || job._id === id);
          console.log('Found job in list:', jobData);
        }
      } catch (listError) {
        console.warn('Could not fetch jobs list:', listError);
      }
    }
    
    if (!jobData) {
      return NextResponse.json(
        { error: 'Job not found' }, 
        { status: 404 }
      );
    }
    
    // Return job data in expected format
    return NextResponse.json({
      success: true,
      data: jobData
    });
  } catch (error) {
    console.error('Error fetching newjob:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' }, 
      { status: 500 }
    );
  }
}