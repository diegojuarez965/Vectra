"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Volume2,
  VolumeX,
} from "lucide-react";
import Scanner from "@/app/components/users/Scanner";
import { ExerciseFeedback } from "@/app/utils/ExerciseAnalyzer";
import { useTextToSpeech } from "@/app/utils/useTextToSpeech";

interface LiveScannerProps {
  confidenceThreshold: number;
  smoothingFactor: number;
}

const POSITIVE_MESSAGES = [
  "Excelente técnica sigue así.",
  "Muy bien mantén el ritmo.",
  "Perfecto esa es la postura.",
  "Bien hecho continúa.",
];

export default function LiveScanner({
  confidenceThreshold,
  smoothingFactor,
}: LiveScannerProps) {
  const [currentFeedback, setCurrentFeedback] =
    useState<ExerciseFeedback | null>({
      errorType: "Sistema",
      message: "Cargando...",
    });

  const [repeticiones, setRepeticiones] = useState(0);

  // Estado para el Mute
  const [isMuted, setIsMuted] = useState(true);

  // Hook de voz
  const { speak, cancel } = useTextToSpeech();

  // Efecto para hablar
  useEffect(() => {
    const triggerSpeach = () => {
      // Si estamos mutados no hacemos nada
      if (isMuted) return;
      let textToSpeak = "";
      if (currentFeedback && currentFeedback.message) {
        // Caso error
        textToSpeak = currentFeedback.message;
      } else {
        // Caso positivo
        textToSpeak =
          POSITIVE_MESSAGES[
            Math.floor(Math.random() * POSITIVE_MESSAGES.length)
          ];
      }
      speak(textToSpeak);
    };

    // Ejecutamos cada vez que cambia el estado
    triggerSpeach();

    // Configurar el intervalo de 10 segundos
    const intervalId = setInterval(() => {
      triggerSpeach();
    }, 10000);

    // Borramos el intervalo anterior para que no se mezclen las voces.
    return () => clearInterval(intervalId);
  }, [currentFeedback, isMuted, speak]);

  // Efecto para cancelar la voz
  useEffect(() => {
    if (isMuted) {
      cancel();
    }
  }, [isMuted, cancel]);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-4 font-sans text-foreground animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-9 space-y-3 md:space-y-4">
          {/* Header de Cámara */}
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-foreground/10 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl text-primary border border-primary/20">
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground leading-none">
                  Cámara en Vivo
                </h2>
                <p className="text-[10px] md:text-xs text-foreground/50 mt-1 uppercase tracking-wider font-semibold">
                  Detección Activa
                </p>
              </div>
            </div>

            {/* Controles Derecha (Mute + Live) */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="cursor-pointer p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-foreground/5"
                title={isMuted ? "Activar Voz" : "Silenciar Voz"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-foreground/50" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                )}
              </button>

              <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-red-500"></span>
                </div>
                <span className="text-[10px] md:text-xs font-bold text-red-500 tracking-widest hidden sm:inline">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Contenedor del Scanner */}
          <div className="relative rounded-xl md:rounded-3xl overflow-hidden border border-foreground/10 bg-black shadow-2xl aspect-3/4 md:aspect-video">
            <Scanner
              mode="live"
              confidence_threshold={confidenceThreshold}
              smoothingFactor={smoothingFactor}
              onFeedbackChange={setCurrentFeedback}
              onRepetitionChange={setRepeticiones}
            />
          </div>
        </div>

        {/* COACH FEEDBACK*/}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Tarjeta de Feedback Principal */}
          <div className="flex-1 bg-black/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 border border-foreground/10 flex flex-col relative overflow-hidden min-h-50 md:min-h-62.5">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 text-primary">
              <Dumbbell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">
                Entrenador Virtual
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center">
              {currentFeedback ? (
                // ESTADO: CORRECCIÓN
                <div className="animate-in zoom-in duration-300 w-full">
                  <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 leading-tight">
                    Corrección
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
                  <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                    Buena Forma
                  </h3>
                  <p className="text-xs md:text-sm text-foreground/50">
                    Todo parece ir bien.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta de Repeticiones */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 border border-foreground/10">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 text-primary">
              <Dumbbell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">
                Repeticiones
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg md:text-2xl font-bold text-foreground">
                {repeticiones}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
