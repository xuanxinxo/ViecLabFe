'use client';

import { NewJobList } from '@/components/NewJobList';

export default function NewJobsPage() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <NewJobList />
      </div>
    </main>
  );
}
