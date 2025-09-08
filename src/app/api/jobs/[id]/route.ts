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

    // Call backend API directly to get job data
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vieclabbe.onrender.com';
    const response = await fetch(`${backendUrl}/api/jobs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Job not found' }, 
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const jobData = await response.json();
    console.log('Backend job data:', jobData);
    
    // Backend returns job object directly, wrap it in expected format
    return NextResponse.json({
      success: true,
      data: jobData
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' }, 
      { status: 500 }
    );
  }
}