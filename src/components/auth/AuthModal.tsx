'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
}

export default function AuthModal({ isOpen }: AuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(isOpen);
  const [isCustomer, setIsCustomer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Close modal if we're on register or login page
    if (pathname === '/register' || pathname === '/login') {
      setShowModal(false);
      return;
    }
    
    setShowModal(isOpen);
  }, [isOpen, pathname]);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      // Redirect to registration page with role parameter
      router.push(`/register?role=${isCustomer ? 'customer' : 'employer'}`);
      setShowModal(false); // Close modal after click
      // Set login status to true after successful registration
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('hasCompletedAuth', 'true');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      // Redirect to login page with role parameter
      router.push(`/login?role=${isCustomer ? 'customer' : 'employer'}`);
      setShowModal(false); // Close modal after click
      // Set login status to true after successful login
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('hasCompletedAuth', 'true');
    } catch (error) {
      console.error('Login error:', error);
      alert('Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is logged in after registration
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        setShowModal(false);
      }
    };

    // Check login status every second
    const interval = setInterval(checkLoginStatus, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Close modal when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setShowModal(false);
    };

    // Listen for route changes
    router.refresh();
    return () => {
      // Cleanup on unmount
    };
  }, [router]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          Chào mừng đến với Vieclab
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center mb-4">
            <input
              type="radio"
              id="customer"
              name="role"
              checked={isCustomer}
              onChange={() => setIsCustomer(true)}
              className="mr-2"
            />
            <label htmlFor="customer" className="text-gray-700">
              Tôi là khách hàng
            </label>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="radio"
              id="employer"
              name="role"
              checked={!isCustomer}
              onChange={() => setIsCustomer(false)}
              className="mr-2"
            />
            <label htmlFor="employer" className="text-gray-700">
              Tôi là nhà tuyển dụng
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-blue-200 rounded-full"></span>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký ngay'
              )}
            </button>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-blue-200 rounded-full"></span>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>

          {/* Remove skip button since registration is mandatory */}
        </div>
      </div>
    </div>
  );
}
