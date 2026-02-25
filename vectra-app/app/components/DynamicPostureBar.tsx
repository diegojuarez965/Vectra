"use client";

import { useState, useEffect } from "react";

export default function DynamicPostureBar() {
  // Porcentaje de progreso
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Sube al 92% apenas carga
    const initialTimeout = setTimeout(() => setScore(92), 100);

    // Fluctúa levemente cada 2 segundos
    const interval = setInterval(() => {
      const randomScore = Math.floor(Math.random() * (99 - 88 + 1) + 88);
      setScore(randomScore);
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground/80">Alineación Cervical</span>
        <span className="text-primary font-bold tabular-nums">{score}%</span>
      </div>

      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
