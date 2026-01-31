"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  PlayCircle,
  Activity,
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Volume2,
  VolumeX,
} from "lucide-react";
import Scanner from "@/app/components/users/Scanner";
import { ExerciseFeedback } from "@/app/utils/ExerciseAnalyzer";
import { useTextToSpeech } from "@/app/utils/useTextToSpeech";

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

  // Estado para el feedback
  const [currentFeedback, setCurrentFeedback] =
    useState<ExerciseFeedback | null>(null);

  // Estado para Mute
  const [isMuted, setIsMuted] = useState(false);

  // Hook de Voz
  const { speak, cancel } = useTextToSpeech();

  // Referencia para el input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpieza de memoria
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      cancel();
    };
  }, [videoSrc, cancel]);

  // Efecto para hablar cuando llega feedback
  useEffect(() => {
    if (currentFeedback && !isMuted && currentFeedback.message) {
      speak(currentFeedback.message);
    }
  }, [currentFeedback, isMuted, speak]);

  // Efecto para cancelar la voz cuando se mutee
  useEffect(() => {
    if (isMuted) {
      cancel();
    }
  }, [isMuted, cancel]);

  // HANDLERS
  const handleFileSelection = (file: File) => {
    if (file && file.type.startsWith("video/")) {
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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCurrentFeedback(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 font-sans text-foreground">
      {/* Zona de Carga */}
      {!videoSrc && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group cursor-pointer flex flex-col items-center justify-center 
            w-full h-80 md:h-125 rounded-2xl md:rounded-3xl border-2 border-dashed transition-all duration-300
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-foreground/10 bg-black/20 hover:bg-black/30 hover:border-primary/50"
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

          <div className="flex flex-col items-center gap-4 md:gap-6 text-center p-6 md:p-8 z-10">
            <div
              className={`
              p-4 md:p-6 rounded-full transition-transform duration-300 shadow-xl
              ${isDragging ? "bg-primary text-foreground scale-110" : "bg-black/40 text-foreground/50 group-hover:text-primary"}
            `}
            >
              <Upload className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Sube tu Video
              </h3>
              <p className="text-sm md:text-base text-foreground/60 max-w-xs mx-auto">
                Arrastra tu archivo aquí para que{" "}
                <span className="text-primary font-bold">Vectra</span> analice
                tu técnica.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard de Análisis */}
      {videoSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Video */}
          <div className="lg:col-span-9 space-y-3 md:space-y-4">
            {/* Header del Video */}
            <div className="flex items-center justify-between bg-black/20 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-foreground/10 shadow-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl text-primary">
                  <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-foreground leading-none truncate max-w-37.5 md:max-w-md">
                    {fileName}
                  </h2>
                  <p className="text-[10px] md:text-xs text-foreground/50 mt-1 uppercase tracking-wider font-semibold">
                    Análisis Biomecánico
                  </p>
                </div>
              </div>

              {/* Controles: Mute + Cerrar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="cursor-pointer p-2 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                  title={isMuted ? "Activar Voz" : "Silenciar Voz"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </button>

                <button
                  onClick={clearVideo}
                  className="cursor-pointer p-2 hover:bg-red-500/10 rounded-full text-foreground/40 hover:text-red-500 transition-colors"
                  title="Cerrar video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenedor Scanner */}
            <div className="relative w-full rounded-xl md:rounded-3xl overflow-hidden border border-foreground/10 bg-black shadow-2xl aspect-3/4 md:aspect-video">
              <Scanner
                mode="file"
                videoSrc={videoSrc}
                confidence_threshold={confidenceThreshold}
                smoothingFactor={smoothingFactor}
                onFeedbackChange={setCurrentFeedback}
              />
            </div>
          </div>

          {/* COACH FEEDBACK */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Tarjeta de Feedback Principal */}
            <div className="flex-1 bg-black/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 border border-foreground/10 flex flex-col relative overflow-hidden min-h-50">
              <div className="flex items-center gap-2 mb-4 md:mb-6 text-primary">
                <Dumbbell className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">
                  Entrenador Virtual
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center text-center">
                {currentFeedback ? (
                  // ESTADO: CORRECCIÓN
                  <div className="animate-in zoom-in duration-300 w-full">
                    <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-red-500/20">
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 leading-tight">
                      Corrección Técnica
                    </h3>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 md:p-4 mt-2">
                      <p className="text-xs md:text-sm text-red-200/90 font-medium">
                        {currentFeedback.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  // ESTADO: BUENA FORMA
                  <div className="animate-in fade-in duration-500 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-green-500/20">
                      <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                      Movimiento Óptimo
                    </h3>
                    <p className="text-xs md:text-sm text-foreground/50">
                      Mantén la tensión y el ritmo. Tu técnica se ve sólida.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de Métricas */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 border border-foreground/10">
              <div className="flex items-center gap-2 mb-4 text-foreground/40">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">
                  Métricas en vivo
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-foreground/60">Precisión IA</span>
                    <span className="text-foreground font-bold">
                      {(confidenceThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[95%] shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-foreground/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-foreground/50">
                      Estado
                    </span>
                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      Analizando
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
