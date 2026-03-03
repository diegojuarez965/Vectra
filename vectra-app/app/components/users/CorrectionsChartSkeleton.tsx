"use client";

export default function CorrectionsChartSkeleton() {
  return (
    <div className="h-full w-full flex flex-col animate-pulse">
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Eje Y Skeleton */}
        <div className="flex flex-col justify-between pb-1 py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-8 h-2 bg-foreground/10 rounded" />
          ))}
        </div>
        {/* Área del gráfico Skeleton simulate AreaChart */}
        <div className="flex-1 border-b border-l border-foreground/10 relative overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full text-foreground/10"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 L0,70 Q10,40 30,60 T60,30 T100,50 L100,100 Z"
              fill="currentColor"
              className="opacity-50"
            />
            <path
              d="M0,70 Q10,40 30,60 T60,30 T100,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {/* Eje X Skeleton */}
      <div className="flex justify-around pl-14 pr-2 pt-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-1/12 h-2 bg-foreground/10 rounded" />
        ))}
      </div>
    </div>
  );
}
