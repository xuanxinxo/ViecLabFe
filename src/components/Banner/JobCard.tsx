'use client';

import Link from "next/link";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div
      className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition relative flex flex-col h-full overflow-hidden transform hover:-translate-y-1 duration-300"
    >
      <img
        src={job.img || "/img/job-icon.svg"}
        alt="Logo"
        className="w-full h-60 object-contain bg-white rounded-t-md"
      />

      <div className="flex-1 mt-3 space-y-1">
        <h3 className="text-base font-semibold text-blue-700 line-clamp-2">{job.title}</h3>
        <p className="text-gray-700 text-sm">{job.company}</p>
        <p className="text-blue-600 text-sm font-medium">{job.salary ?? 'Negotiable'}</p>
        <p className="text-xs text-gray-500">{job.location}</p>
        <span className="text-xs text-gray-400 block">
          {job.postedDate ? new Date(job.postedDate).toLocaleDateString("vi-VN") : 'N/A'}
        </span>
      </div>

      <div className="flex justify-between items-center mt-3 text-xs">
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onApply(job)}
            className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 whitespace-nowrap"
          >
            Ứng tuyển
          </button>
          <Link
            href={`/banner/${job.id}`}
            className="flex-1 text-center bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 whitespace-nowrap"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}





