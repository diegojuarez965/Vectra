"use client";

export default function HorizontalBarChartSkeleton() {
  return (
    <div className="flex-1 flex flex-col animate-pulse w-full h-full p-2">
      <div className="flex-1 w-full flex flex-col justify-around border-l border-b border-foreground/10 pl-4 pb-2">
        {/* Barras horizontales simuladas */}
        {[85, 65, 45, 30, 20].map((width, i) => (
          <div key={i} className="flex items-center gap-4 w-full h-8">
            {/* Etiqueta simulada (Y-Axis) */}
            <div className="w-24 h-3 bg-foreground/10 rounded-md shrink-0"></div>
            {/* Barra simulada */}
            <div
              className="h-full bg-foreground/10 rounded-r-md"
              style={{ width: `${width}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
