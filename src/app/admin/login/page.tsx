'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    // Check if there's an admin-token cookie
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/jobs', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('✅ Already authenticated, redirecting to admin');
            router.push('/admin');
          }
        }
      } catch (error) {
        console.log('🔍 Not authenticated, staying on login page');
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Make the actual POST request to the same domain
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Quan trọng để gửi và nhận cookie
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      console.log('Login response status:', response.status, response.statusText);
      
      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      let data;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error(`Server returned invalid JSON. Status: ${response.status} ${response.statusText}`);
      }
      
      console.log('Parsed response data:', data);
      
      if (!response.ok) {
        const serverMsg = data?.message || data?.error;
        console.error('❌ Login failed:', { status: response.status, message: serverMsg });
        throw new Error(serverMsg || `Đăng nhập thất bại (${response.status} ${response.statusText})`);
      }
      
      if (data?.success === false) {
        const serverMsg = data?.message || data?.error;
        console.error('❌ Login failed (success: false):', serverMsg);
        throw new Error(serverMsg || 'Đăng nhập thất bại');
      }
      
      console.log('Login response data:', data);
      
      // Backend admin login returns { success, data: { accessToken, refreshToken, user } }
      const token = data?.data?.accessToken || data?.token;
      if (token) {
        // Cookie is already set by the server, no need to store in localStorage
        // localStorage.setItem('adminToken', token);
        
        // Redirect to admin dashboard
        router.push('/admin');
        router.refresh(); // Force a refresh to update auth state
      } else {
        throw new Error('Không nhận được token đăng nhập');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đăng nhập vào hệ thống quản lý TOREDCO
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 