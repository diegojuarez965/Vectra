"use client";

import DynamicPostureBar from "./DynamicPostureBar";

export default function HeroScanner() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Tarjeta contenedora */}
      <div className="relative z-10 p-5 rounded-2xl bg-[#2a2a2a]/80 border border-white/10 backdrop-blur-md shadow-2xl">
        {/* --- VENTANA DE ESCANEO --- */}
        <div className="aspect-3/4 rounded-lg bg-black/50 border border-white/5 relative overflow-hidden group">
          {/* 1. Fondo Cuadriculado (Grid) */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#4a4a4a 1px, transparent 1px), linear-gradient(90deg, #4a4a4a 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* 2. Esqueleto Biomecánico (SVG) */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <svg viewBox="0 0 100 200" className="h-full w-full drop-shadow-lg">
              {/* Estilo de las líneas (Huesos) */}
              <g
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-white/40"
              >
                {/* Cabeza */}
                <circle cx="50" cy="20" r="12" fill="none" />
                {/* Columna */}
                <line x1="50" y1="32" x2="50" y2="80" />
                {/* Hombros */}
                <line x1="30" y1="40" x2="70" y2="40" />
                {/* Brazos Izquierdo */}
                <line x1="30" y1="40" x2="25" y2="70" />
                <line x1="25" y1="70" x2="20" y2="95" />
                {/* Brazo Derecho */}
                <line x1="70" y1="40" x2="75" y2="70" />
                <line x1="75" y1="70" x2="80" y2="95" />
                {/* Caderas */}
                <line x1="35" y1="80" x2="65" y2="80" />
                {/* Pierna Izquierda */}
                <line x1="35" y1="80" x2="35" y2="120" />
                <line x1="35" y1="120" x2="35" y2="160" />
                {/* Pierna Derecha */}
                <line x1="65" y1="80" x2="65" y2="120" />
                <line x1="65" y1="120" x2="65" y2="160" />
              </g>

              {/* Puntos de Articulación (Joints) - Brillan en Naranja */}
              <g fill="currentColor" className="text-primary animate-pulse">
                <circle cx="50" cy="20" r="2" /> {/* Nariz/Cabeza */}
                <circle cx="30" cy="40" r="2" /> {/* Hombro Izq */}
                <circle cx="70" cy="40" r="2" /> {/* Hombro Der */}
                <circle cx="25" cy="70" r="2" /> {/* Codo Izq */}
                <circle cx="75" cy="70" r="2" /> {/* Codo Der */}
                <circle cx="50" cy="80" r="2" /> {/* Pelvis Central */}
                <circle cx="35" cy="120" r="2" /> {/* Rodilla Izq */}
                <circle cx="65" cy="120" r="2" /> {/* Rodilla Der */}
              </g>
            </svg>
          </div>

          {/* 3. Barra Láser de Escaneo (Animación CSS pura) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-full h-[0.5] bg-primary shadow-[0_0_15px_rgba(255,87,34,0.8)] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
            {/* Degradado que sigue a la barra */}
            <div className="w-full h-10 bg-linear-to-t from-primary/20 to-transparent absolute top-0 -mt-10 animate-[scan_3s_ease-in-out_infinite]" />
          </div>

          {/* Texto Scanning */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest">
              AI_ANALYSIS
            </span>
          </div>
        </div>

        {/* --- COMPONENTE DE BARRA (Reutilizado) --- */}
        <DynamicPostureBar />
      </div>

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            top: 100%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
