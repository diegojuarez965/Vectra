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
} from "lucide-react";
import {
  BicepCurlAnalyzer,
  ExerciseFeedback,
} from "@/app/utils/ExerciseAnalyzer";

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
}

export default function Scanner({
  mode,
  videoSrc = null,
  confidence_threshold,
  smoothingFactor,
  onFeedbackChange,
  onRepetitionChange,
}: ScannerProps) {
  // REFS
  const containerRef = useRef<HTMLDivElement>(null); // Contenedor principal
  const webcamRef = useRef<Webcam>(null); // Webcam para modo "live"
  const fileVideoRef = useRef<HTMLVideoElement>(null); // Video para modo "file"
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas para dibujo
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Modelo de IA
  const requestRef = useRef<number>(0); // Referencia para requestAnimationFrame
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null); // Últimos puntos detectados
  const analyzerRef = useRef<BicepCurlAnalyzer | null>(null); // Referencia al analizador
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

  const isMirrored = mode === "live" && facingMode === "user"; // Espejado solo en modo "live" y cámara frontal

  useEffect(() => {
    analyzerRef.current = new BicepCurlAnalyzer();
  }, []);

  useEffect(() => {
    if (onFeedbackChange) {
      onFeedbackChange(feedback);
    }
  }, [feedback, onFeedbackChange]);

  useEffect(() => {
    if (onRepetitionChange) {
      onRepetitionChange(repeticiones);
    }
  }, [repeticiones, onRepetitionChange]);

  // 1. Cargar el modelo de IA
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
    // IMPORTANTE: No reseteamos highestTimestamp ni offset aquí para mantener la continuidad y evitar crashes.
  }, [videoSrc]);

  // Listener Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.error("Error fullscreen:", err);
      }
    } else {
      document.exitFullscreen();
    }
  };

  // 2. Loop de Detección
  useEffect(() => {
    const predict = () => {
      const feedbackCargando = {
        errorType: "Sistema",
        message: "Cargando...",
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
              const repetitionCount = analyzerRef.current?.repetitionCounter || 0;
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
    repeticiones
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
      className="relative w-full h-[85vh] md:h-auto md:max-w-4xl md:aspect-video mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
    >
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#2a2a2a] text-white">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">
            Cargando Motores Neuronales...
          </p>
        </div>
      )}

      {mode === "live" && (
        <>
          {isModelLoaded && cameraPermission === false && (
            <div className="absolute inset-0 z-40 bg-black/90 text-white p-6 text-center flex flex-col items-center justify-center">
              <CameraOff className="w-16 h-16 text-red-500 mb-4" />
              <p className="mb-4">Acceso denegado</p>
              <button
                onClick={() => window.location.reload()}
                className="cursor-pointer px-4 py-2 bg-white/10 rounded flex gap-2"
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
            disablePictureInPicture
          />
          {webcamRunning && (
            <button
              onClick={toggleCamera}
              className="cursor-pointer absolute bottom-6 right-6 z-40 p-4 bg-primary/80 rounded-full text-white"
            >
              <SwitchCamera />
            </button>
          )}
        </>
      )}

      {mode === "file" && (
        <>
          {!videoSrc ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
              <Upload className="w-16 h-16 mb-4 opacity-30" />
              <p>Sube un video</p>
            </div>
          ) : (
            <video
              ref={fileVideoRef}
              src={videoSrc}
              className="absolute inset-0 w-full h-full object-contain bg-black [&::-webkit-media-controls-fullscreen-button]:hidden [&::-webkit-media-controls-overflow-button]:hidden"
              controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
              disablePictureInPicture
              controls
              playsInline
              loop
              crossOrigin="anonymous"
              onPlay={() => setIsFilePlaying(true)}
              onPause={() => setIsFilePlaying(false)}
            />
          )}
        </>
      )}

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none ${mode === "file" ? "object-contain" : "object-cover"} ${isMirrored ? "transform -scale-x-100" : ""}`}
      />

      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10 backdrop-blur-md">
          {mode === "live" ? (
            <>
              <div
                className={`w-2 h-2 rounded-full ${webcamRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-xs font-mono text-white/80">LIVE</span>
            </>
          ) : (
            <>
              <Play
                className={`w-3 h-3 ${isFilePlaying ? "text-green-500" : "text-white/50"}`}
              />
              <span className="text-xs font-mono text-white/80">REPLAY</span>
            </>
          )}
        </div>

        {(webcamRunning || videoSrc) && (
          <button
            onClick={toggleFullscreen}
            className="cursor-pointer p-1.5 bg-black/50 hover:bg-primary/80 text-white rounded-full border border-white/10 transition-colors backdrop-blur-md"
            title={isFullscreen ? "Salir" : "Maximizar"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
