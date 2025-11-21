import React from 'react';

// Base Skeleton Component
export const Skeleton = ({ className = '', variant = 'rounded' }) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    rectangular: 'rounded-none',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variants[variant] || variants.rounded} ${className}`}
    />
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1a252f] rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-5/6" variant="text" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white dark:bg-[#1a252f] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" variant="text" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1a252f] rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" variant="text" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12" variant="circular" />
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1a252f] rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" variant="circular" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <div className="bg-white dark:bg-[#1e2936] rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <Skeleton className="h-7 w-1/3 mb-6" variant="title" />
      <div className="space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" variant="text" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

// Dashboard Skeleton (Complete Dashboard Layout)
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Skeleton className="h-8 w-20" />
              <div className="hidden md:flex gap-6">
                <Skeleton className="h-4 w-24" variant="text" />
                <Skeleton className="h-4 w-32" variant="text" />
                <Skeleton className="h-4 w-20" variant="text" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" variant="circular" />
              <Skeleton className="h-9 w-9" variant="circular" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

// Requests Page Skeleton
export const RequestsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" variant="circular" />
              <Skeleton className="h-9 w-9" variant="circular" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" variant="title" />
          <Skeleton className="h-10 w-40" />
        </div>
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
};

// Request Detail Skeleton
export const RequestDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" variant="circular" />
              <Skeleton className="h-9 w-9" variant="circular" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1e2936] rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex justify-between items-start gap-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e2936] rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Skeleton className="h-6 w-40 mb-4" variant="title" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" variant="text" />
                <Skeleton className="h-4 w-5/6" variant="text" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" variant="text" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" variant="text" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e2936] rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Skeleton className="h-6 w-32 mb-4" variant="title" />
              <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e2936] rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Page Skeleton
export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" variant="circular" />
              <Skeleton className="h-9 w-9" variant="circular" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Skeleton */}
        <div className="bg-gradient-to-r from-[#5B4002] to-[#8B6002] rounded-t-lg px-6 py-8 shadow-xl">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 bg-white/30" variant="circular" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48 bg-white/30" />
              <Skeleton className="h-5 w-32 bg-white/30" />
              <Skeleton className="h-4 w-40 bg-white/30" />
            </div>
          </div>
        </div>

        {/* Profile Content Skeleton */}
        <div className="bg-white dark:bg-[#1e2936] rounded-b-lg shadow-xl border-x border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" variant="text" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;