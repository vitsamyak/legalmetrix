import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SkeletonLoader = ({ className, ...props }: SkeletonLoaderProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/5 rounded-md",
        className
      )}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-surface-secondary/80 backdrop-blur-md rounded-2xl border border-border/80 shadow-lg p-6 w-full">
    <SkeletonLoader className="h-6 w-1/3 mb-4 rounded-lg" />
    <SkeletonLoader className="h-4 w-1/4 mb-8 rounded-lg bg-white/5" />
    <div className="space-y-3">
      <SkeletonLoader className="h-20 w-full rounded-xl bg-white/5" />
      <SkeletonLoader className="h-20 w-full rounded-xl bg-white/5" />
    </div>
  </div>
);
