"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, FileVideo, Film } from "lucide-react";
import Scanner from "@/app/components/users/Scanner";

interface FileScannerProps {
  confidenceThreshold: number;
  smoothingFactor: number;
}

export default function FileScanner({
  confidenceThreshold,
  smoothingFactor,
}: FileScannerProps) {
  // Estado para el archivo de video
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Referencia para el input oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpieza de memoria al desmontar o cambiar video
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  // --- HANDLERS ---

  const handleFileSelection = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      // Si ya había un video, limpiamos la URL anterior para no fugar memoria
      if (videoSrc) URL.revokeObjectURL(videoSrc);

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setFileName(file.name);
    } else {
      alert("Por favor sube un archivo de video válido.");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const clearVideo = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setFileName(null);
    // Resetear el input para permitir subir el mismo archivo de nuevo si se desea
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. ZONA DE CARGA (Si no hay video) */}
      {!videoSrc && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group cursor-pointer flex flex-col items-center justify-center 
            w-full h-96 rounded-2xl border-2 border-dashed transition-all duration-300
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="video/*"
            className="hidden"
          />

          {/* Iconografía y Texto */}
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div
              className={`p-5 rounded-full transition-colors ${isDragging ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 group-hover:text-white"}`}
            >
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Sube tu Video
              </h3>
              <p className="text-sm text-white/50 max-w-xs mx-auto">
                Arrastra y suelta tu archivo aquí, o haz clic para explorar.
                Soporta MP4, MOV, WEBM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ZONA DE ANÁLISIS (Si hay video) */}
      {videoSrc && (
        <div className="animate-in fade-in zoom-in duration-500">
          {/* Header del Player */}
          <div className="flex items-center justify-between mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{fileName}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Listo para analizar
                </p>
              </div>
            </div>

            <button
              onClick={clearVideo}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
              title="Quitar video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* COMPONENTE SCANNER */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <Scanner
              mode="file"
              videoSrc={videoSrc}
              confidence_threshold={confidenceThreshold}
              smoothingFactor={smoothingFactor}
            />
          </div>

          {/* Instrucciones Pie de página */}
          <div className="mt-4 flex gap-4 text-xs text-white/30 font-mono justify-center">
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" /> CONTROLES NATIVOS ACTIVADOS
            </span>
            <span>•</span>
            <span>USA LA BARRA DE TIEMPO PARA NAVEGAR</span>
          </div>
        </div>
      )}
    </div>
  );
}
