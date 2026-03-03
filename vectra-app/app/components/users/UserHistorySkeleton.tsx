"use client";

export default function UserHistorySkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-background/40 border border-foreground/10 rounded-2xl p-5 flex flex-col shadow-sm min-h-[220px]"
          >
            {/* HEADER: Fecha Skeleton */}
            <div className="flex items-center gap-2 border-b border-foreground/10 pb-4 mb-4">
              <div className="w-4 h-4 rounded-full bg-foreground/10 shrink-0" />
              <div className="w-32 h-4 bg-foreground/10 rounded" />
            </div>

            {/* BODY: Ejercicio y Repeticiones Skeleton */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-foreground/10 rounded-lg shrink-0" />
                  <div className="w-24 h-5 bg-foreground/10 rounded" />
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="w-10 h-8 bg-foreground/10 rounded" />
                  <div className="w-16 h-2 bg-foreground/10 rounded" />
                </div>
              </div>

              {/* FOOTER: Feedbacks Skeleton */}
              <div className="pt-4 border-t border-foreground/5 mt-auto">
                <div className="flex flex-col gap-3">
                  <div className="w-32 h-3 bg-foreground/10 rounded" />
                  <div className="flex flex-wrap gap-2">
                    <div className="w-16 h-6 bg-foreground/10 rounded-lg" />
                    <div className="w-24 h-6 bg-foreground/10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION SKELETON */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-foreground/10 mt-8">
        <div className="w-24 h-10 bg-foreground/10 rounded-lg" />
        <div className="w-32 h-4 bg-foreground/10 rounded" />
        <div className="w-24 h-10 bg-foreground/10 rounded-lg" />
      </div>
    </div>
  );
}
