import { NextResponse } from 'next/server';

// Cookie configuration
const COOKIE_NAME = 'admin-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: '/',
};

export const serverCookieHelper = {
  /**
   * Set admin token to response cookies
   */
  setTokenToResponse(response: NextResponse, token: string): void {
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  },

  /**
   * Delete admin token from response cookies
   */
  deleteTokenFromResponse(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(0),
    });
  },

  /**
   * Get admin token from request cookies
   */
  getTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies[COOKIE_NAME] || null;
  },

  /**
   * Check if admin token exists in request
   */
  hasToken(request: Request): boolean {
    return this.getTokenFromRequest(request) !== null;
  }
};

// Client-side cookie helper (for browser)
export const clientCookieHelper = {
  /**
   * Set admin token in browser cookies
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    document.cookie = `${COOKIE_NAME}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  },

  /**
   * Get admin token from browser cookies
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === COOKIE_NAME) {
        return value;
      }
    }
    return null;
  },

  /**
   * Delete admin token from browser cookies
   */
  deleteToken(): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  /**
   * Check if admin token exists in browser
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }
};
