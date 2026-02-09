"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Volume2,
  VolumeX,
  Play,
  Square,
  XCircle,
  Activity,
} from "lucide-react";
import Scanner from "@/app/components/users/Scanner";
import { ExerciseFeedback } from "@/app/utils/ExerciseAnalyzer";
import { useTextToSpeech } from "@/app/utils/useTextToSpeech";
import { useRef } from "react";
import { submitFeedbacks, submitRepetitions } from "@/app/lib/actions";

interface LiveScannerProps {
  confidenceThreshold: number;
  smoothingFactor: number;
  userID: string | undefined;
}

const POSITIVE_MESSAGES = ["Excelente", "Muy bien", "Perfecto", "Bien hecho"];

export default function LiveScanner({
  confidenceThreshold,
  smoothingFactor,
  userID,
}: LiveScannerProps) {
  // Estado de control de escaneo
  const [isScanning, setIsScanning] = useState(false);

  // Estado para el último feedback
  const [currentFeedback, setCurrentFeedback] =
    useState<ExerciseFeedback | null>({
      errorType: "SYSTEM",
      message: "Cargando",
    });

  // Lista de feedbacks
  const feedbacksAcumulados = useRef<ExerciseFeedback[]>([]);

  // Estado para las repeticiones
  const [repeticiones, setRepeticiones] = useState(0);

  // Estado para el Mute
  const [isMuted, setIsMuted] = useState(true);

  // Hook de voz
  const { speak, cancel } = useTextToSpeech();

  // Handlers para los botones
  const handleStart = () => {
    setRepeticiones(0);
    setCurrentFeedback({ errorType: "SYSTEM", message: "Cargando" });
    setIsScanning(true);
  };

  const handleStop = () => {
    // Enviar las repeticiones
    if (repeticiones > 0 && userID) {
      submitRepetitions(repeticiones, userID, "BICEP_CURL");
      setRepeticiones(0);
    }
    // Enviar feedbacks técnicos acumulados al finalizar el escaneo
    if (feedbacksAcumulados.current.length > 0 && userID) {
      submitFeedbacks(feedbacksAcumulados.current, userID);
      feedbacksAcumulados.current = [];
    }
    cancel(); // Cortar voz
    setIsScanning(false);
  };

  const handleCancel = () => {
    cancel(); // Cortar voz
    setRepeticiones(0);
    setIsScanning(false);
  };

  // Efecto para acumular feedbacks técnicos
  useEffect(() => {
    if (currentFeedback && currentFeedback.errorType === "TECHNICAL") {
      feedbacksAcumulados.current.push(currentFeedback);
    }
  }, [currentFeedback]);

  // Efecto para hablar
  useEffect(() => {
    // Si no está escaneando, no hablamos
    if (!isScanning) return;

    const triggerSpeach = () => {
      if (isMuted) return;

      let textToSpeak = "";
      if (currentFeedback && currentFeedback.message) {
        // Evitamos decir feedbacks de sistema
        if (currentFeedback.errorType === "SYSTEM") return;

        textToSpeak = currentFeedback.message;
      } else {
        textToSpeak =
          POSITIVE_MESSAGES[
            Math.floor(Math.random() * POSITIVE_MESSAGES.length)
          ];
      }

      if (textToSpeak) speak(textToSpeak);
    };

    triggerSpeach();

    const intervalId = setInterval(() => {
      triggerSpeach();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [currentFeedback, isMuted, speak, isScanning]);

  // Efecto para cancelar voz al mutear
  useEffect(() => {
    if (isMuted) {
      cancel();
    }
  }, [isMuted, cancel]);

  // 1. PANTALLA DE INICIO
  if (!isScanning) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl text-center max-w-lg w-full shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Listo para Entrenar
          </h2>
          <p className="text-white/60 mb-8">
            Asegúrate de tener buena iluminación y que tu cuerpo sea visible en
            la cámara.
          </p>
          <button
            onClick={handleStart}
            className="cursor-pointer w-full py-4 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(var(--primary),0.4)] flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            INICIAR ANÁLISIS
          </button>
        </div>
      </div>
    );
  }

  // 2. PANTALLA DE ESCANEO
  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-4 font-sans text-foreground animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* COLUMNA PRINCIPAL */}
        <div className="lg:col-span-9 space-y-3 md:space-y-4">
          {/* Header de Cámara con Controles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/20 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-foreground/10 shadow-sm">
            {/* Título */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl text-primary border border-primary/20">
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground leading-none">
                  Cámara en Vivo
                </h2>
                <p className="text-[10px] md:text-xs text-foreground mt-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{" "}
                  Grabando
                </p>
              </div>
            </div>

            {/* BOTONERA SUPERIOR */}
            <div className="flex items-center justify-end gap-2">
              {/* Botón Mute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="cursor-pointer flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-foreground transition-colors"
                title={isMuted ? "Activar Voz" : "Silenciar Voz"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 opacity-50" />
                ) : (
                  <Volume2 className="w-5 h-5 text-primary" />
                )}
              </button>

              <div className="h-6 w-px bg-white/10 mx-1" />

              {/* Botón Cancelar */}
              <button
                onClick={handleCancel}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-foreground rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </button>

              {/* Botón Detener */}
              <button
                onClick={handleStop}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <Square className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Guardar</span>
              </button>
            </div>
          </div>

          {/* Contenedor del Scanner */}
          <div className="relative rounded-xl md:rounded-3xl overflow-hidden border-none bg-background shadow-2xl aspect-3/4 md:aspect-video">
            {/* Solo renderizamos Scanner si isScanning es true para activar la cámara */}
            {isScanning && (
              <Scanner
                mode="live"
                confidence_threshold={confidenceThreshold}
                smoothingFactor={smoothingFactor}
                onFeedbackChange={setCurrentFeedback}
                onRepetitionChange={setRepeticiones}
              />
            )}
          </div>
        </div>

        {/* COLUMNA LATERAL (FEEDBACK) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {currentFeedback ? (
              <div className="animate-in zoom-in duration-300 w-full">
                {/* ICONO */}
                <div
                  className={`
                    mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4 border shadow-[0_0_20px_rgba(0,0,0,0.2)]
                    ${
                      currentFeedback.errorType === "SYSTEM"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : currentFeedback.errorType === "POSITIONING"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    }
                  `}
                >
                  <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                </div>

                {/* TÍTULO */}
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 leading-tight">
                  {currentFeedback.errorType === "SYSTEM"
                    ? "Sistema"
                    : currentFeedback.errorType === "POSITIONING"
                      ? "Posición"
                      : "Corrección Técnica"}
                </h3>

                {/* CAJA DE MENSAJE */}
                <div
                  className={`
                    border rounded-xl p-3 md:p-4 mt-2
                    ${
                      currentFeedback.errorType === "SYSTEM"
                        ? "bg-blue-500/5 border-blue-500/10"
                        : currentFeedback.errorType === "POSITIONING"
                          ? "bg-yellow-500/5 border-yellow-500/10"
                          : "bg-red-500/5 border-red-500/10"
                    }
                  `}
                >
                  <p
                    className={`text-xs md:text-sm font-medium 
                      ${
                        currentFeedback.errorType === "SYSTEM"
                          ? "text-blue-200/90"
                          : currentFeedback.errorType === "POSITIONING"
                            ? "text-yellow-200/90"
                            : "text-red-200/90"
                      }`}
                  >
                    {currentFeedback.message}
                  </p>
                </div>
              </div>
            ) : (
              /* ESTADO: BUENA FORMA */
              <div className="animate-in fade-in duration-500 opacity-60 hover:opacity-100 transition-opacity">
                <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                  Buena Forma
                </h3>
                <p className="text-xs md:text-sm text-foreground/50">
                  Todo parece ir bien
                </p>
              </div>
            )}
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
              <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter">
                {repeticiones}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
