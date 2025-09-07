import React, { useState } from 'react';
import LocationFilter from './LocationFilter';
import { useRouter } from 'next/navigation';

const filters = [
  { label: 'Lọc theo khu vực', icon: '📍', type: 'location' },
  { label: 'Cấp cao', icon: '⭐', type: 'senior' },
  { label: 'Lao động phổ thông', icon: '🛠️', type: 'general' },
  { label: 'Nhân viên part-time', icon: '⏰', type: 'part-time' },
];

interface JobFilter {
  type: string;
  label: string;
  icon: string;
}

export default function HiringFilter() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleFilterClick = (filter: JobFilter) => {
    const query = new URLSearchParams();
    
    if (filter.type === 'location') {
      if (!selectedLocation) {
        alert('Vui lòng chọn tỉnh thành trước khi lọc theo khu vực');
        return;
      }
      query.set('location', selectedLocation); 
    } else {
      query.set('type', filter.type);
    }

    router.push(`/jobs/filtered?${query.toString()}`);
  };

  const handleLocationSelect = (province: string) => {
    setSelectedLocation(province);
  };

  return (
    <div className="w-full flex flex-col items-center mt-8 mb-8">
      {/* <LocationFilter onLocationSelect={handleLocationSelect} />
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => handleFilterClick(filter)}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl px-4 py-6 shadow-sm hover:shadow-md hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{filter.icon}</span>
            <span className="font-semibold text-gray-700 group-hover:text-blue-600 text-sm text-center">
              {filter.label}
            </span>
          </button>
        ))}
      </div> */}
    </div>
  );
}
