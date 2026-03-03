"use client";

export default function ErrorDistributionChartSkeleton() {
  return (
    <div className="flex-1 flex flex-col animate-pulse w-full">
      {/* Chart Skeleton */}
      <div className="w-full h-55 shrink-0 flex items-center justify-center">
        {/* Donut Chart simulate */}
        <div className="w-40 h-40 rounded-full border-20 border-foreground/10 relative" />
      </div>

      {/* Legend Skeleton */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {[...Array(4)].map((_, index) => (
          <div
            key={`legend-skeleton-${index}`}
            className="flex items-center gap-2 bg-foreground/5 px-2 py-1 rounded-md border border-foreground/5"
          >
            {/* Color dot */}
            <div className="w-3 h-3 rounded-full shrink-0 bg-foreground/10" />
            {/* Text simulate */}
            <div className="w-16 h-3 bg-foreground/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
