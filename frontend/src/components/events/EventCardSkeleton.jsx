import React from 'react';

function EventCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft">
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full animate-pulse bg-mist" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded-full bg-mist" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-mist" />
          </div>
          <div className="h-6 w-5/6 animate-pulse rounded-lg bg-mist" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-mist" />
        </div>

        <div className="flex items-center justify-between border-t border-ink/5 pt-4">
          <div className="h-5 w-20 animate-pulse rounded-full bg-mist" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-mist" />
        </div>
      </div>
    </div>
  );
}

export default EventCardSkeleton;
