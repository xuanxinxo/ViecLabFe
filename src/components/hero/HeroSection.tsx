'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const VIETNAM_PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 'Phú Yên', 'Cần Thơ',
  'Đà Nẵng', 'Hải Phòng', 'Hà Nội', 'TP Hồ Chí Minh'
];

const FNB_JOB_CATEGORIES = [
  'Phục vụ nhà hàng',
  'Pha chế',
  'Đầu bếp',
  'Quản lý nhà hàng',
  'Quản lý khách sạn',
  'Lễ tân',
  'Nhân viên pha chế',
  'Nhân viên phục vụ',
  'Nhân viên pha chế trà sữa',
  'Nhân viên pha chế cà phê',
  'Nhân viên thu ngân',
  'Nhân viên phục vụ bàn',
  'Nhân viên pha chế cocktail',
  'Nhân viên pha chế trà',
  'Quản lý quán cà phê',
  'Quản lý nhà hàng khách sạn',
  'Nhân viên pha chế trà sữa trân châu',
  'Nhân viên pha chế trà sữa',
  'Nhân viên pha chế trà sữa Đài Loan',
  'Nhân viên pha chế trà sữa Hồng Kông'
];

interface HeroSectionProps {
  provinces?: string[];
  jobTitles?: string[];
  jobCategories?: string[];
}

export default function HeroSection({
  provinces = VIETNAM_PROVINCES,
  jobTitles = [],
  jobCategories = FNB_JOB_CATEGORIES
}: HeroSectionProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Reset error
      setError('');

      // Validate at least one field is filled
      if (!jobTitle && !selectedCategory && !selectedProvince) {
        setError('Vui lòng nhập ít nhất một tiêu chí tìm kiếm');
        return;
      }

      // Validate job title length if provided
      if (jobTitle && jobTitle.length < 2) {
        setError('Từ khóa tìm kiếm phải có ít nhất 2 ký tự');
        return;
      }

      setSearching(true);

      // Build search params
      const params = new URLSearchParams();
      if (jobTitle) params.append('search', jobTitle);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedProvince) params.append('location', selectedProvince);

      // Navigate to search page
      const navigateAndReset = async () => {
        try {
          await router.push(`/search?${params.toString()}`);
          // Reset form after successful navigation
          setJobTitle('');
          setSelectedCategory('');
          setSelectedProvince('');
        } catch (error) {
          console.error('Navigation error:', error);
          setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
        } finally {
          setSearching(false);
        }
      };

      void navigateAndReset();
    },
    [jobTitle, selectedCategory, selectedProvince, router]
  );

  return (
    <div
      className="w-full relative border-y-2 border-blue-700"
      style={{
        backgroundImage: "url('/img/dn.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-blue-700/70"></div>

      <div className="relative z-10">
        {/* Animated text */}
        <div className="w-full overflow-hidden h-20 sm:h-24 flex items-center mt-10">
          <p className="whitespace-nowrap animate-marquee text-xl sm:text-2xl font-semibold text-white tracking-wide">
            🚀 Tìm việc dễ dàng, ứng tuyển chỉ với 1 cú click! &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
            💼 Kết nối nhanh với nhà tuyển dụng uy tín! &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
            📌 Việc làm mơ ước không còn xa – Khám phá ngay!
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full flex justify-center py-6 px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 flex flex-col sm:flex-row gap-3 w-full max-w-6xl">
            {/* Job Title Input */}
            <div className="relative flex-1">
              <div className="flex items-center bg-white border rounded-md px-3 py-2 h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                </svg>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Tên công việc, vị trí ứng tuyển"
                  className="w-full outline-none text-gray-700 bg-transparent"
                  list="job-title-list"
                />
                <datalist id="job-title-list">
                  {jobTitles.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Job Category Select */}
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option
                  value=""
                  className="font-semibold text-blue-600 bg-blue-50"
                >
                  Tất cả ngành nghề
                </option>
                <div className="border-t border-gray-200 my-1"></div>
                {jobCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="hover:bg-blue-50"
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="relative flex-1">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full h-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option
                  value=""
                  className="font-semibold text-blue-600 bg-blue-50"
                >
                  Tất cả địa điểm
                </option>
                <div className="border-t border-gray-200 my-1"></div>
                {provinces.map((province) => (
                  <option
                    key={province}
                    value={province}
                    className="hover:bg-blue-50"
                  >
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={searching}
              className={`px-6 py-2.5 rounded-md font-semibold text-white transition-all flex items-center justify-center min-w-[120px] ${searching
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md transform hover:scale-105'
                }`}
            >
              {searching ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang tìm...
                </>
              ) : (
                'Tìm việc ngay'
              )}
            </button>

          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-center px-4">
            <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
