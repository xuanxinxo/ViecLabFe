'use client';
// import { Job } from '@/src/app/types/job';
import { Job } from '@/types/job';

import React, { useState } from 'react';
import Link from 'next/link';
import UnifiedApplyModal from '../UnifiedApplyModal';

export default function JobCardNew({ job }: { job: Job }) {
  const [showModal, setShowModal] = useState(false);

  const handleApplyClick = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') ||
          document.cookie.match(/token=([^;]+)/)?.[1] ||
          ''
        : '';
    if (!token) {
      alert('Bạn cần đăng nhập để ứng tuyển!');
      window.location.href = '/login';
      return;
    }
    setShowModal(true);
  };

  return (
    <div
      key={job._id || job.id}
      className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full justify-between"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start space-x-3">
          <div className="min-w-0">
            <h4 className="font-semibold text-lg text-blue-900 truncate">{job.title}</h4>
            <p className="text-gray-600 truncate">
              {job.company} - {job.location}
            </p>
          </div>
          {job.img && (
            <img
              src={job.img}
              alt={`${job.company} logo`}
              className="h-10 w-10 object-contain rounded"
            />
          )}
        </div>

        <div className="flex gap-2 flex-wrap mt-2">
          {job.type && (
            <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded">
              {job.type}
            </span>
          )}
          {job.salary && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {job.salary}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          {(Array.isArray(job.requirements) ? job.requirements.slice(0, 2) : []).map(
            (req, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
              >
                {req}
              </span>
            )
          )}
          {Array.isArray(job.requirements) && job.requirements.length > 2 && (
            <span className="text-xs text-gray-500">
              +{job.requirements.length - 2} yêu cầu khác
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleApplyClick}
          className="w-full sm:w-auto text-sm bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 font-medium shadow"
        >
          Ứng tuyển
        </button>
        <Link
          href={`/jobnew/${job._id || job.id}`}
          className="w-full sm:w-auto text-sm text-blue-600 hover:text-blue-800 font-medium text-center bg-blue-50 rounded px-4 py-2 hover:bg-blue-100 transition-colors duration-200"
        >
          Xem chi tiết →
        </Link>
      </div>
         <UnifiedApplyModal open={showModal} onClose={() => setShowModal(false)} job={job} type="newjob" />
    </div>
  );
}