import React from 'react';
import { provinces } from '@/src/lib/provinces';

interface LocationFilterProps {
  onLocationSelect: (province: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm tỉnh thành..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          list="provinces"
          onChange={(e) => {
            const province = e.target.value;
            if (provinces.includes(province)) {
              onLocationSelect(province);
            }
          }}
        />
        <datalist id="provinces">
          {provinces.map((province) => (
            <option key={province} value={province} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default LocationFilter;
