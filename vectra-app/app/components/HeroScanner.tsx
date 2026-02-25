"use client";

import DynamicPostureBar from "./DynamicPostureBar";
import Image from "next/image";

export default function HeroScanner() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Tarjeta contenedora */}
      <div className="relative z-10 p-5 rounded-2xl bg-[#2a2a2a]/80 border border-foreground/10 backdrop-blur-md shadow-2xl">
        {/* Ventana de Escaneo */}
        <div className="aspect-3/4 rounded-lg bg-black/50 border border-foreground/5 relative overflow-hidden group">
          {/* Fondo Cuadriculado */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#4a4a4a 1px, transparent 1px), linear-gradient(90deg, #4a4a4a 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Esqueleto Biomecánico */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/images/bio-skeleton.png"
              alt="Esqueleto Biomecánico"
              fill
              className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            />
          </div>

          {/* Barra Láser de Escaneo */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-full h-[0.5] bg-primary shadow-[0_0_15px_rgba(255,87,34,0.8)] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
            {/* Degradado que sigue a la barra */}
            <div className="w-full h-10 bg-linear-to-t from-primary/20 to-transparent absolute top-0 -mt-10 animate-[scan_3s_ease-in-out_infinite]" />
          </div>

          {/* Texto Scanning */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/60 px-2 py-1 rounded border border-foreground/10 backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest">
              AI_ANALYSIS
            </span>
          </div>
        </div>

        {/* Componente de barra dinámica de postura */}
        <DynamicPostureBar />
      </div>

      {/* Estilo de animación para la barra de escaneo */}
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
