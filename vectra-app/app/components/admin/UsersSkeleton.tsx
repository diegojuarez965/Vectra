"use client";

interface UsersSkeletonProps {
  count?: number;
}

export default function UsersSkeleton({ count = 6 }: UsersSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div>
      {/* MOBILE SKELETON */}
      <div className="md:hidden p-4 space-y-3">
        {items.map((_, i) => (
          <div
            key={`skeleton-mobile-${i}`}
            className="bg-foreground/3 rounded-lg p-3 border border-foreground/10 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-foreground/10 rounded w-32" />
              <div className="h-3 bg-foreground/10 rounded w-16" />
            </div>
            <div className="mt-2 h-3 bg-foreground/10 rounded w-full" />

            <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 bg-foreground/10 rounded-full w-16" />
                <div className="h-6 bg-foreground/10 rounded-full w-20" />
              </div>
              <div className="h-8 w-8 bg-foreground/10 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP / TABLE SKELETON */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-foreground/10 bg-foreground/5">
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                ID
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                Nombre
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                Email
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                Rol
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                Estado
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((_, i) => (
              <tr
                key={`skeleton-row-${i}`}
                className={`border-b border-foreground/10 ${
                  i % 2 === 0 ? "bg-transparent" : "bg-foreground/2"
                }`}
              >
                <td className="px-6 py-4 flex justify-center">
                  <div className="h-4 bg-foreground/10 rounded w-12 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="mx-auto h-4 bg-foreground/10 rounded w-36 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="mx-auto h-4 bg-foreground/10 rounded w-48 animate-pulse" />
                </td>
                <td className="px-6 py-4 flex justify-center">
                  <div className="h-6 bg-foreground/10 rounded-full w-20 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="mx-auto h-6 bg-foreground/10 rounded-full w-24 animate-pulse" />
                </td>
                <td className="px-6 py-4 flex justify-center">
                  <div className="h-8 bg-foreground/10 rounded-lg w-24 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SKELETON */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-foreground/10 mt-6 mb-4 animate-pulse w-full max-w-7xl mx-auto">
        <div className="w-24 h-10 bg-foreground/10 rounded-lg" />
        <div className="w-32 h-4 bg-foreground/10 rounded" />
        <div className="w-24 h-10 bg-foreground/10 rounded-lg" />
      </div>
    </div>
  );
}
