"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { SuspenseBoundary } from '@/components/SuspenseBoundary';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <SuspenseBoundary>
      <LoginContent />
    </SuspenseBoundary>
  );
}

function LoginContent() {
  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from registration
  useEffect(() => {
    const registered = searchParams.get('registered');
    const verified = searchParams.get('verified');
    
    if (registered === 'true') {
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
    }
    
    if (verified === 'true') {
      setSuccess('Xác thực email thành công! Vui lòng đăng nhập.');
    } else if (verified === 'false') {
      setError('Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    // Clear errors when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Basic validation
    if (!form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const payload = await apiClient.auth.login({ email: form.email, password: form.password });
      
      console.log('Login response:', payload);

      if (!payload?.success) {
        throw new Error(payload?.message || 'Đăng nhập thất bại');
      }

      const user = payload?.data?.user;
      const token = payload?.data?.token;

      setSuccess('Đăng nhập thành công! Đang chuyển hướng...');

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      if (token) {
        localStorage.setItem('token', token);
      }

      const redirectTo = user?.role === 'admin' ? '/admin' : '/';
      setTimeout(() => {
        try {
          router.push(redirectTo);
        } catch (routerError) {
          console.error('Router error:', routerError);
          window.location.href = redirectTo;
        }
      }, 800);
      
      // Log the full response for debugging
      console.log('Full login response:', payload);
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = err?.message || 'Có lỗi xảy ra khi đăng nhập';
      
      // Handle specific error cases
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.';
      } else if (err?.message?.includes('timeout')) {
        errorMessage = 'Server phản hồi chậm. Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              đăng ký tài khoản mới
            </Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Hiện tại backend chưa có tài khoản test. 
              Vui lòng liên hệ quản trị viên để được cấp tài khoản hoặc kiểm tra lại thông tin đăng nhập.
            </p>
          </div>
        </div>
        
        {/* Success and Error Messages */}
        {success && (
          <div className="p-4 rounded-md bg-green-50 text-green-800">
            {success}
          </div>
        )}
        
        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Địa chỉ email"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link 
                href="/forgot-password" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
                aria-disabled={isLoading}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
