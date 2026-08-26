import React from 'react';

// Base skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    {/* Progress Cards Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
            <Skeleton className="w-16 h-8" />
          </div>
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>

    {/* Progress Breakdown Skeleton */}
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 sm:mb-8">
      <Skeleton className="w-48 h-6 mb-4 sm:mb-6" />
      <div className="space-y-4 sm:space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
            <Skeleton className="w-full h-3 rounded-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Chapters List Skeleton */}
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
      <Skeleton className="w-32 h-6 mb-4 sm:mb-6" />
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
                  <Skeleton className="w-48 h-5" />
                </div>
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-2 sm:mb-3" />
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
              <Skeleton className="w-full sm:w-24 h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Chapters Grid Skeleton
export const ChaptersGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 bg-blue-400" />
          <Skeleton className="w-32 h-5 mb-1 bg-blue-400" />
          <Skeleton className="w-20 h-4 bg-blue-400" />
        </div>
        {/* Body */}
        <div className="p-4 sm:p-6">
          <Skeleton className="w-full h-5 mb-2" />
          <Skeleton className="w-full h-4 mb-1" />
          <Skeleton className="w-3/4 h-4 mb-3 sm:mb-4" />

          {/* Progress */}
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between mb-1.5 sm:mb-2">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-12 h-3" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>

          {/* Stats */}
          <div className="flex justify-between mb-3 sm:mb-4">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Quizzes Grid Skeleton
export const QuizzesGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-500 to-purple-600">
          <Skeleton className="w-12 h-12 mb-2 bg-purple-400" />
          <Skeleton className="w-40 h-6 bg-purple-400" />
        </div>
        {/* Body */}
        <div className="p-4 sm:p-6">
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-4 mb-4" />

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </div>

          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// Progress Stats Skeleton
export const ProgressStatsSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Overall Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow">
          <Skeleton className="w-8 h-8 mb-3" />
          <Skeleton className="w-20 h-8 mb-2" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="bg-white p-6 rounded-xl shadow">
      <Skeleton className="w-48 h-6 mb-6" />
      <Skeleton className="w-full h-64" />
    </div>

    {/* Activity */}
    <div className="bg-white p-6 rounded-xl shadow">
      <Skeleton className="w-40 h-6 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-32 h-3" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Results List Skeleton
export const ResultsListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow border-2 border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-48 h-5 mb-2" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="flex-1 sm:w-24 h-10 rounded-lg" />
            <Skeleton className="flex-1 sm:w-24 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
