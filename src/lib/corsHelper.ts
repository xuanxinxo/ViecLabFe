// CORS Helper - Utility functions for adding CORS headers to API responses

import { NextResponse } from 'next/server';

/**
 * Add CORS headers to a NextResponse
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * Create a CORS-enabled OPTIONS response
 */
export function createCorsOptionsResponse(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

/**
 * Create a CORS-enabled JSON response
 */
export function createCorsJsonResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}
