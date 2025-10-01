'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from '../../auth/AuthModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Kiểm tra xem người dùng đã truy cập trang web trước đó chưa
    const hasVisited = localStorage.getItem('hasVisited');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPath = window.location.pathname;
    const hasCompletedAuth = localStorage.getItem('hasCompletedAuth');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Set initial user state if available
    if (storedUser && (token || isLoggedIn === 'true')) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {}
    }

    // Nếu chưa truy cập và chưa đăng nhập, hiển thị modal đăng ký
    if (!hasVisited && !isLoggedIn && !hasCompletedAuth && !currentPath.startsWith('/register') && !currentPath.startsWith('/login')) {
      setShowAuthModal(true);
      localStorage.setItem('hasVisited', 'true');
    }

    // Nếu đã truy cập nhưng chưa đăng nhập và chưa hoàn thành auth, vẫn hiển thị modal
    if (hasVisited && !isLoggedIn && !hasCompletedAuth && !currentPath.startsWith('/register') && !currentPath.startsWith('/login')) {
      setShowAuthModal(true);
    }

    // Kiểm tra trạng thái đăng nhập mỗi giây
    const checkLoginStatus = () => {
      const isLoggedInNow = localStorage.getItem('isLoggedIn');
      const tokenNow = localStorage.getItem('token');
      const userNow = localStorage.getItem('user');
      if (isLoggedInNow === 'true' || !!tokenNow) {
        setShowAuthModal(false);
        // Đánh dấu là đã hoàn thành quá trình đăng nhập
        localStorage.setItem('hasCompletedAuth', 'true');
        if (userNow) {
          try {
            setCurrentUser(JSON.parse(userNow));
          } catch {}
        }
      }
    };

    const interval = setInterval(checkLoginStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes (e.g., from other tabs) and set user
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'isLoggedIn') {
        const userNow = localStorage.getItem('user');
        const tokenNow = localStorage.getItem('token');
        const isLoggedInNow = localStorage.getItem('isLoggedIn');
        if (userNow && (tokenNow || isLoggedInNow === 'true')) {
          try {
            setCurrentUser(JSON.parse(userNow));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('hasCompletedAuth');
    } catch {}
    setCurrentUser(null);
    try {
      router.push('/');
    } catch {
      window.location.href = '/';
    }
  };

  // Close auth modal when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setShowAuthModal(false);
    };

    // Listen for route changes
    router.refresh();
    return () => {
      // Cleanup on unmount
    };
  }, [router]);
  

  const provinces = [
    'Hà Nội', 'Hà Giang', 'Cao Bằng', 'Lạng Sơn', 'Tuyên Quang', 'Lào Cai', 'Yên Bái', 'Sơn La', 'Điện Biên',
    'Lai Châu', 'Phú Thọ', 'Vĩnh Phúc', 'Bắc Giang', 'Quảng Ninh', 'Bắc Kạn', 'Thái Nguyên', 'Lạng Sơn',
    'Hải Dương', 'Hải Phòng', 'Quảng Ninh', 'Thái Bình', 'Nam Định', 'Ninh Bình', 'Thanh Hóa', 'Nghệ An',
    'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định',
    'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông',
    'Lâm Đồng', 'Bình Phước', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'TP. Hồ Chí Minh', 'Long An',
    'Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cà Mau', 'Sóc Trăng',
    'Bạc Liêu', 'Trà Vinh', 'Hậu Giang'
  ];

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-blue-900 to-blue-800'
      }`}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start mb-4 md:mb-0">
            <h1 className={`text-4xl font-extrabold tracking-widest ${isScrolled ? 'text-blue-900' : 'text-white'
              } transition-colors duration-300`}>
              VIECLAB
            </h1>
            <p className={`text-base font-semibold uppercase tracking-wide ${isScrolled ? 'text-blue-800' : 'text-white'
              }`}>
              Powered By <span className="font-bold">TOREDCO</span>
            </p>
            <p className={`text-sm ${isScrolled ? 'text-blue-700' : 'text-white'
              }`}>
              Nền Tảng Kết Nối Minh Bạch
            </p>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 mb-4 md:mb-0">
            <Link
              href="/jobs"
              className={`nav-link ${isScrolled
                  ? "text-gray-700 hover:text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
                } transition-colors duration-300 relative group`}
            >
              Tìm việc làm
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-1/2"></span>
            </Link>

            <Link
              href="/jobnew"
              className={`nav-link ${isScrolled
                  ? "text-gray-700 hover:text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
                } transition-colors duration-300 relative group`}
            >
              Tìm người làm
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-1/2"></span>
            </Link>

            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                const footer = document.getElementById("footer");
                if (footer) {
                  footer.scrollIntoView({ behavior: "smooth" });
                  window.history.pushState(null, "", "#footer");
                }
              }}
              className={`nav-link ${isScrolled
                  ? "text-gray-700 hover:text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
                } transition-colors duration-300 relative group cursor-pointer`}
            >
              Liên hệ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-1/2"></span>
            </a>
{/* 
            <Link
              href="/reviews"
              className={`nav-link ${isScrolled
                  ? "text-gray-700 hover:text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
                } transition-colors duration-300 relative group`}
            >
              Đánh giá
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-1/2"></span>
            </Link> */}
          </div>

          {/* Auth / User */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2">
                  {/* Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(currentUser.avatar || currentUser.imageUrl || currentUser.photo || '/img/ava.jpg') as string}
                    alt={currentUser.name || currentUser.email || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <span className={`${isScrolled ? 'text-blue-900' : 'text-white'} font-semibold hidden sm:inline`}>
                    {currentUser.name || currentUser.fullName || currentUser.email || 'Tài khoản'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${isScrolled
                    ? 'border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                    : 'border-2 border-white text-white hover:bg-white hover:text-blue-900'
                    }`}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => {
                    try {
                      window.location.href = '/login';
                    } catch (error) {
                      console.error('Navigation error:', error);
                      // Fallback: try router.push
                      router.push('/login');
                    }
                  }}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${isScrolled
                    ? 'bg-blue-900 text-white hover:bg-blue-800'
                    : 'bg-white text-blue-900 hover:bg-gray-100'
                    }`}
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => {
                    try {
                      window.location.href = '/register';
                    } catch (error) {
                      console.error('Navigation error:', error);
                      // Fallback: try router.push
                      router.push('/register');
                    }
                  }}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${isScrolled
                    ? 'border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                    : 'border-2 border-white text-white hover:bg-white hover:text-blue-900'
                    }`}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>

          {/* Auth Modal for first-time visitors */}
          <AuthModal isOpen={showAuthModal} />
        </div>
      </nav>
    </header>
  );
}