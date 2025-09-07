"use client";

import { Job } from "@/src/app/types/job";
import Link from "next/link";

export default function JobCard({
  job,
  onApply,
}: {
  job: Job;
  onApply: () => void;
}) {
  return (
    <div className="bg-white border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-lg mx-auto p-5 flex flex-col justify-between">
      {/* Header: Tiêu đề & Logo */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900 break-words line-clamp-2">
            {job.title}
          </h4>
          <p className="text-gray-600 text-sm mt-1">
            {job.company} - {job.location}
          </p>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mt-3">
            {job.type && (
              <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded-full">
                {job.type}
              </span>
            )}
            {job.salary && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {job.salary}
              </span>
            )}
          </div>
        </div>

        {/* Logo công ty */}
        {job.img && (
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={job.img}
              alt={`${job.company} logo`}
              className="w-full h-full object-contain rounded-md border"
            />
          </div>
        )}
      </div>

      {/* Mô tả */}
      <p className="text-gray-700 text-sm mt-4 line-clamp-3">
        {job.description}
      </p>

      {/* Yêu cầu */}
      <div className="flex flex-wrap gap-2 mt-3">
        {(Array.isArray(job.requirements)
          ? job.requirements.slice(0, 2)
          : []
        ).map((req, i) => (
          <span
            key={i}
            className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
          >
            {req}
          </span>
        ))}
        {Array.isArray(job.requirements) && job.requirements.length > 2 && (
          <span className="text-xs text-gray-500">
            +{job.requirements.length - 2} yêu cầu khác
          </span>
        )}
      </div>

      {/* Nút hành động */}
      <div className="flex flex-row gap-3 mt-5">
        <button
          onClick={onApply}
          className="flex-1 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Ứng tuyển
        </button>
        <Link
          href={`/detailjobs/${job.id}`}
          className="flex-1 text-sm text-blue-600 hover:text-blue-800 font-medium text-center bg-blue-50 rounded-lg px-4 py-2 transition-colors"
        >
          Xem chi tiết →
        </Link>
      </div>

    </div>
  );
}
