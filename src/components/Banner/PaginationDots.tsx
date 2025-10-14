'use client';

interface PaginationDotsProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
}

export default function PaginationDots({ total, current, onChange }: PaginationDotsProps) {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`w-3 h-3 rounded-full ${i === current ? 'bg-blue-600' : 'bg-gray-300'}`}
          onClick={() => onChange(i)}
          aria-label={`Trang ${i + 1}`}
        />
      ))}
    </div>
  );
}








