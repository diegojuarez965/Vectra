"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver, // Para cargar los archivos WASM
  PoseLandmarker, // El modelo de Pose Landmarker
  PoseLandmarkerResult, // Tipo de resultado
  NormalizedLandmark, // Tipo de punto normalizado
  DrawingUtils, // Utilidades de dibujo
} from "@mediapipe/tasks-vision";
import {
  Loader2,
  CameraOff,
  RefreshCw,
  SwitchCamera,
  Play,
  Upload,
  Maximize,
  Minimize,
  VolumeX,
  Volume2,
  Pause,
} from "lucide-react";
import { BicepCurlAnalyzer, SquatAnalyzer } from "@/app/utils/ExerciseAnalyzer";
import { Exercise, ExerciseFeedback } from "@/app/lib/definitions";

// Conexiones del esqueleto relevantes
const MY_CONNECTIONS = [
  { start: 11, end: 12 }, // Hombros
  { start: 11, end: 13 }, // Hombro Izq -> Codo Izq
  { start: 13, end: 15 }, // Codo Izq -> Muñeca Izq
  { start: 12, end: 14 }, // Hombro Der -> Codo Der
  { start: 14, end: 16 }, // Codo Der -> Muñeca Der
  { start: 11, end: 23 }, // Hombro Izq -> Cadera Izq
  { start: 12, end: 24 }, // Hombro Der -> Cadera Der
  { start: 23, end: 24 }, // Caderas
  { start: 23, end: 25 }, // Cadera Izq -> Rodilla Izq
  { start: 25, end: 27 }, // Rodilla Izq -> Tobillo Izq
  { start: 24, end: 26 }, // Cadera Der -> Rodilla Der
  { start: 26, end: 28 }, // Rodilla Der -> Tobillo Der
];

// (Hombros, Codos, Muñecas, Caderas, Rodillas, Tobillos)
const RELEVANT_LANDMARKS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// Función de interpolación lineal para suavizado
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

interface ScannerProps {
  mode: "live" | "file";
  videoSrc?: string | null;
  confidence_threshold: number;
  smoothingFactor: number;
  onFeedbackChange: (feedback: ExerciseFeedback | null) => void;
  onRepetitionChange: (repeticiones: number) => void;
  exercise: Exercise;
}

export default function Scanner({
  mode,
  videoSrc = null,
  confidence_threshold,
  smoothingFactor,
  onFeedbackChange,
  onRepetitionChange,
  exercise,
}: ScannerProps) {
  // REFS
  const containerRef = useRef<HTMLDivElement>(null); // Contenedor principal
  const webcamRef = useRef<Webcam>(null); // Webcam para modo "live"
  const fileVideoRef = useRef<HTMLVideoElement>(null); // Video para modo "file"
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas para dibujo
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Modelo de IA
  const requestRef = useRef<number>(0); // Referencia para requestAnimationFrame
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null); // Últimos puntos detectados
  const analyzerRef = useRef<BicepCurlAnalyzer | SquatAnalyzer | null>(null); // Referencia al analizador
  const lastFeedbackRef = useRef<ExerciseFeedback | null>(null); // Referencia al feedback anterior
  const feedbackCooldownRef = useRef<number>(0); // Rerencia al tiempo del último error para dar tiempo a corregir la técnica
  const COOLDOWN_MS = 5000; // 5 segundos de pausa

  // Referencias para la lógica de "Reloj Monotónico"
  const lastVideoTimeRef = useRef<number>(-1); // Último tiempo real de video procesado
  const timestampOffsetRef = useRef<number>(0); // Tiempo que le sumamos al real para enviar al modelo en modo "file"
  const highestTimestampSentRef = useRef<number>(0); // Mayor tiempo enviado a la IA en modo "file"

  // ESTADOS
  const [isModelLoaded, setIsModelLoaded] = useState(false); // Modelo cargado
  const [webcamRunning, setWebcamRunning] = useState(false); // Estado de la webcam
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  ); // Permiso de cámara
  const [isFilePlaying, setIsFilePlaying] = useState(false); // Estado del video
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // Cámara frontal/trasera
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null); // Feedback del ejercicio
  const [repeticiones, setRepeticiones] = useState(0); // Contador de repeticiones

  // Estados de Reproductor Personalizado
  const [currentTime, setCurrentTime] = useState(0); // Tiempo actual
  const [duration, setDuration] = useState(0); // Duración total
  const [isMuted, setIsMuted] = useState(false); // Mute
  const [showControls, setShowControls] = useState(true); // Mostrar controles

  const isMirrored = mode === "live" && facingMode === "user"; // Espejado solo en modo "live" y cámara frontal

  // Inicializar el analizador de ejercicio
  useEffect(() => {
    switch (exercise) {
      case "BICEP_CURL":
        analyzerRef.current = new BicepCurlAnalyzer();
        break;
      case "SQUAT":
        analyzerRef.current = new SquatAnalyzer();
        break;
      default:
        analyzerRef.current = new BicepCurlAnalyzer();
    }
  }, [exercise]);

  // Enviar feedback al padre cuando cambie
  useEffect(() => {
    if (onFeedbackChange) {
      onFeedbackChange(feedback);
    }
  }, [feedback, onFeedbackChange]);

  // Enviar repeticiones al padre cuando cambie
  useEffect(() => {
    if (onRepetitionChange) {
      onRepetitionChange(repeticiones);
    }
  }, [repeticiones, onRepetitionChange]);

  // LÓGICA DEL REPRODUCTOR PERSONALIZADO

  // Escuchar el teclado para salir de fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // Alternar fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Alternar reproducción
  const togglePlayPause = () => {
    if (fileVideoRef.current) {
      if (isFilePlaying) {
        fileVideoRef.current.pause();
      } else {
        fileVideoRef.current.play();
      }
      setIsFilePlaying(!isFilePlaying);
    }
  };

  // Alternar mute
  const toggleMute = () => {
    if (fileVideoRef.current) {
      fileVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Actualizar tiempo actual durante la reproducción
  const handleTimeUpdate = () => {
    if (fileVideoRef.current) {
      setCurrentTime(fileVideoRef.current.currentTime);
    }
  };

  // Actualizar duración del video al cargar metadata
  const handleLoadedMetadata = () => {
    if (fileVideoRef.current) {
      setDuration(fileVideoRef.current.duration);
    }
  };

  // Actualizar el tiempo actual al cambiar el slider
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (fileVideoRef.current) {
      fileVideoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Formatear el tiempo en minutos:segundos
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Cargar el modelo de IA
  useEffect(() => {
    const createPoseLandmarker = async () => {
      // Limpiar el modelo anterior
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      setIsModelLoaded(false);

      try {
        // Descargar los archivos WASM necesarios
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        // Cargar el modelo de Pose Landmarker
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          minPoseDetectionConfidence: confidence_threshold,
          minPosePresenceConfidence: confidence_threshold,
          minTrackingConfidence: confidence_threshold,
          runningMode: "VIDEO",
          numPoses: 1,
        });
        console.log("Modelo Cargado. Umbral:", confidence_threshold);
        poseLandmarkerRef.current = landmarker;
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error cargando modelo:", error);
      }
    };
    createPoseLandmarker();
    return () => {
      poseLandmarkerRef.current?.close();
    };
  }, [confidence_threshold]);

  // Resetear al cambiar video
  useEffect(() => {
    prevLandmarksRef.current = null;
    lastVideoTimeRef.current = -1;
    // No reseteamos highestTimestamp ni offset aquí para mantener la continuidad y evitar crashes.
  }, [videoSrc]);

  // Loop de Detección
  useEffect(() => {
    const predict = () => {
      const feedbackCargando: ExerciseFeedback = {
        errorType: "SYSTEM",
        message: "Cargando",
      };

      const setFeedbackCargando = () => {
        if (feedbackCargando.message !== lastFeedbackRef.current?.message) {
          setFeedback(feedbackCargando);
          lastFeedbackRef.current = feedbackCargando;
        }
      };
      // Controles de condición iniciales
      if (!isModelLoaded) {
        setFeedbackCargando();
        return;
      }
      if (mode === "live" && !webcamRunning) {
        setFeedbackCargando();
        return;
      }
      if (mode === "file" && !videoSrc) {
        setFeedbackCargando();
        return;
      }

      let video: HTMLVideoElement | null = null; // Fuente de video
      let realVideoTime = 0; // Tiempo real del video
      let timestampForAI = 0; // Timestamp a enviar al modelo

      // Obtener el video y tiempo según el modo
      if (mode === "live" && webcamRef.current?.video) {
        video = webcamRef.current.video; // Fuente de video en modo "live"
        realVideoTime = performance.now(); // Tiempo real basado en performance.now() para el modo "live"
        timestampForAI = realVideoTime; // Enviar tiempo real directamente al modelo en modo "live"
      } else if (mode === "file" && fileVideoRef.current) {
        video = fileVideoRef.current; // Fuente de video en modo "file"
        realVideoTime = video.currentTime * 1000; // Convertir a milisegundos para el modo "file"

        // 1. Si el tiempo no ha cambiado (Pausa), no procesamos.
        if (realVideoTime === lastVideoTimeRef.current) {
          requestRef.current = requestAnimationFrame(predict);
          return;
        }

        // 2. Cálculo preliminar del tiempo a enviar al modelo en modo "file" considerando el offset acumulado:
        let candidateTime = realVideoTime + timestampOffsetRef.current;

        // 3. Si el nuevo tiempo es muy cercano al último enviado, forzamos el avance.
        const MIN_GAP = 1.5;
        if (candidateTime < highestTimestampSentRef.current + MIN_GAP) {
          const gap = highestTimestampSentRef.current - candidateTime + 33; // Calculamos cuánto nos falta para alcanzar al último tiempo enviado y le sumamos ~1 frame
          timestampOffsetRef.current += gap; // Guardamos esta corrección en el acumulador global para que los siguientes frames también mantengan esta coherencia temporal.
          candidateTime = realVideoTime + timestampOffsetRef.current; // Actualizamos el tiempo a enviar
        }

        timestampForAI = candidateTime;
        highestTimestampSentRef.current = timestampForAI;
        lastVideoTimeRef.current = realVideoTime;
      }

      // Verificar si el frame de video es válido
      const isValidFrame =
        video && video.readyState >= 2 && video.videoHeight > 0;

      // Realizamos el canvas y la predicción solo si el frame es válido
      if (isValidFrame && video) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          try {
            const results: PoseLandmarkerResult =
              poseLandmarkerRef.current!.detectForVideo(video, timestampForAI); // Obtenemos resultados del modelo en el instante de tiempo correspondiente

            let finalLandmarks = null;
            if (results.landmarks && results.landmarks.length > 0) {
              const rawLandmarks = results.landmarks[0]; // Tomamos solo la primera persona detectada

              // Suavizado de puntos con interpolación lineal excepto la primera vez
              if (prevLandmarksRef.current) {
                finalLandmarks = rawLandmarks.map((point, index) => {
                  const prevPoint = prevLandmarksRef.current![index];
                  return {
                    x: lerp(prevPoint.x, point.x, smoothingFactor),
                    y: lerp(prevPoint.y, point.y, smoothingFactor),
                    z: lerp(prevPoint.z, point.z, smoothingFactor),
                    visibility: point.visibility,
                  } as NormalizedLandmark;
                });
              } else {
                finalLandmarks = rawLandmarks;
              }
              prevLandmarksRef.current = finalLandmarks;

              // Lógica de repeticiones
              const repetitionCount =
                analyzerRef.current?.repetitionCounter || 0;
              // Actualizamos solo si ha cambiado
              if (repetitionCount !== repeticiones) {
                setRepeticiones(repetitionCount);
              }

              // Lógica de COOLDOWN
              const now = Date.now();
              const isInCooldown =
                now - feedbackCooldownRef.current < COOLDOWN_MS;
              // Solo analizamos si no estamos en COOLDOWN
              if (!isInCooldown) {
                if (analyzerRef.current && finalLandmarks) {
                  const analysisResult = analyzerRef.current.analyze(
                    finalLandmarks,
                    video.videoWidth,
                    video.videoHeight,
                  );

                  // Actualizamos el feedback solo si ha cambiado
                  if (
                    analysisResult?.message !== lastFeedbackRef.current?.message
                  ) {
                    setFeedback(analysisResult);
                    lastFeedbackRef.current = analysisResult;

                    // Si detectamos un error activamos el COOLDOWN
                    if (analysisResult !== null) {
                      feedbackCooldownRef.current = now;
                    }
                  }
                }
              }

              // Dibujar en el canvas
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const drawingUtils = new DrawingUtils(ctx);
                // Dibujar esqueleto
                if (finalLandmarks) {
                  drawingUtils.drawConnectors(finalLandmarks, MY_CONNECTIONS, {
                    color: "#ff5722",
                    lineWidth: 4,
                  });
                  // Dibujar puntos relevantes
                  RELEVANT_LANDMARKS.forEach((index) => {
                    const point = finalLandmarks![index];
                    if (point) {
                      ctx.beginPath();
                      ctx.arc(
                        point.x * canvas.width,
                        point.y * canvas.height,
                        5,
                        0,
                        2 * Math.PI,
                      );
                      ctx.fillStyle = "#FFFFFF";
                      ctx.fill();
                      ctx.lineWidth = 2;
                      ctx.strokeStyle = "#ff5722";
                      ctx.stroke();
                    }
                  });
                }
              }
            } else {
              // No se detectaron puntos
              setFeedbackCargando();
              prevLandmarksRef.current = null;
              const ctx = canvas.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          } catch {
            setFeedback(feedbackCargando);
            console.warn("Error durante la predicción del modelo.");
          }
        }
      } else {
        // El frame no es válido
        setFeedbackCargando();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      requestRef.current = requestAnimationFrame(predict); // Siguiente iteración recursiva
    };

    requestRef.current = requestAnimationFrame(predict); // Iniciar el loop
    return () => {
      // Cancelar el requestAnimationFrame al desmontar o cambiar dependencias
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    smoothingFactor,
    isModelLoaded,
    webcamRunning,
    facingMode,
    mode,
    videoSrc,
    repeticiones,
  ]);

  // HANDLERS
  // Manejo de permisos de cámara
  const handleUserMedia = () => {
    setCameraPermission(true);
    setWebcamRunning(true);
  };

  // Manejo de error en permisos de cámara
  const handleUserMediaError = () => {
    setCameraPermission(false);
    setWebcamRunning(false);
  };

  // Alternar cámara frontal/trasera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div
      ref={containerRef}
      // Al hacer click en el contenedor, mostramos/ocultamos controles
      onClick={() => setShowControls((prev) => !prev)}
      className={`bg-black/20 overflow-hidden shadow-2xl group transition-all duration-300 border-none
      ${isFullscreen
          ? "fixed inset-0 z-100 w-screen h-dvh rounded-none"
          : "relative w-full h-full rounded-xl"
        }`}
      // Evita scroll accidental en móvil fullscreen
      style={{ touchAction: isFullscreen ? "none" : "auto" }}
    >
      {/* Loader */}
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 text-foreground">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">
            Cargando Motores Neuronales...
          </p>
        </div>
      )}

      {/* MODO LIVE */}
      {mode === "live" && (
        <>
          {isModelLoaded && cameraPermission === false && (
            <div className="absolute inset-0 z-40 bg-black/20 text-foreground p-6 text-center flex flex-col items-center justify-center">
              <CameraOff className="w-16 h-16 text-red-400 mb-4" />
              <p className="mb-4">Acceso denegado</p>
              <button
                onClick={() => window.location.reload()}
                className="cursor-pointer px-4 py-2 bg-primary hover:opacity-80 rounded flex gap-2"
              >
                <RefreshCw /> Recargar
              </button>
            </div>
          )}
          <Webcam
            ref={webcamRef}
            mirrored={isMirrored}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            videoConstraints={{
              facingMode,
              width: { ideal: 640 },
              height: { ideal: 480 },
            }}
            className="absolute inset-0 w-full h-full object-cover"
            controls={false}
            playsInline
          />
          {webcamRunning && (
            <button
              aria-label="Cambiar cámara"
              onClick={(e) => {
                e.stopPropagation();
                toggleCamera();
              }}
              className="cursor-pointer absolute top-4 left-4 z-60 p-3 bg-background hover:bg-primary/80 text-foreground rounded-full border border-foreground/10 backdrop-blur-md"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </>
      )}

      {/* MODO FILE */}
      {mode === "file" && (
        <>
          {!videoSrc ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/80">
              <Upload className="w-16 h-16 mb-4 opacity-30" />
              <p>Sube un video</p>
            </div>
          ) : (
            <>
              {/* VIDEO SIN CONTROLES NATIVOS */}
              <video
                ref={fileVideoRef}
                src={videoSrc}
                className="absolute inset-0 w-full h-full object-contain bg-black z-10"
                controls={false}
                playsInline
                webkit-playsinline="true"
                loop
                crossOrigin="anonymous"
                onPlay={() => setIsFilePlaying(true)}
                onPause={() => setIsFilePlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />

              {/* BARRA DE CONTROLES PERSONALIZADA */}
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-0 left-0 right-0 z-60 bg-linear-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
                  {/* BARRA DE ADELANTAMIENTO  */}
                  <div className="flex items-center gap-3 text-foreground text-xs font-mono font-medium">
                    <span className="min-w-10 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1.5 bg-foreground/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <span className="min-w-40px">{formatTime(duration)}</span>
                  </div>

                  {/* BOTONERA INFERIOR */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-6">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlayPause}
                        className="cursor-pointer text-foreground hover:text-primary transition-transform active:scale-90"
                      >
                        {isFilePlaying ? (
                          <Pause className="w-7 h-7 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 fill-current" />
                        )}
                      </button>

                      {/* Botón de Sonido */}
                      <button
                        onClick={toggleMute}
                        className="cursor-pointer text-foreground hover:text-primary transition-transform active:scale-90"
                      >
                        {isMuted ? (
                          <VolumeX className="w-6 h-6 text-red-400" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    {/* Botón Fullscreen */}
                    <button
                      aria-label="Fullscreen"
                      onClick={toggleFullscreen}
                      className="cursor-pointer text-foreground hover:text-primary transition-transform active:scale-90"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-6 h-6" />
                      ) : (
                        <Maximize className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-20 ${mode === "file" ? "object-contain" : "object-cover"} ${isMirrored ? "transform -scale-x-100" : ""}`}
      />

      {/* BADGES SUPERIORES */}
      <div className="absolute top-4 right-4 z-50 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-foreground/10 backdrop-blur-md">
          {mode === "live" ? (
            <>
              <div
                className={`w-2 h-2 rounded-full ${webcamRunning ? "bg-green-500 animate-pulse" : "bg-red-400/5"}`}
              />
              <span className="text-xs font-mono text-foreground/80">LIVE</span>
            </>
          ) : (
            <>
              <Play
                className={`w-3 h-3 ${isFilePlaying ? "text-green-500" : "text-foreground/80"}`}
              />
              <span className="text-xs font-mono text-foreground/80">REPLAY</span>
            </>
          )}
        </div>
      </div>

      {/* Botón fullscreen para Live */}
      {mode === "live" && webcamRunning && (
        <div className="absolute top-4 right-4 z-60 mt-10">
          {" "}
          <button
            aria-label="Fullscreen"
            onClick={toggleFullscreen}
            className="hover:bg-primary/80 cursor-pointer p-2 bg-background text-foreground rounded-full border border-foreground/10 backdrop-blur-md"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
