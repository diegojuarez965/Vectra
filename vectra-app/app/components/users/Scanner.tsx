"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver, // Componente necesaria para cargar modelos
  PoseLandmarker, // Modelo de Detección de Humanos
  PoseLandmarkerResult, // Tipo de resultado del modelo
  NormalizedLandmark, // Tipo de punto normalizado
  DrawingUtils, // Utilidades para dibujar en canvas
} from "@mediapipe/tasks-vision";
import { Loader2, CameraOff, RefreshCw, SwitchCamera } from "lucide-react";

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
  confidence_threshold: number;
  smoothingFactor: number;
}

export default function Scanner({
  confidence_threshold,
  smoothingFactor,
}: ScannerProps) {
  const webcamRef = useRef<Webcam>(null); // Referencia a componente Webcam
  const canvasRef = useRef<HTMLCanvasElement>(null); // Referencia a Canvas para dibujo
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Referencia al modelo
  const requestRef = useRef<number>(0); // Referencia para requestAnimationFrame
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null); // Referencia para suavizado de puntos

  // ESTADOS
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );

  // Estado para controlar qué cámara se usa ("user" = frontal, "environment" = trasera)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Calculamos si debemos espejar la imagen (Solo espejar si es frontal)
  const isMirrored = facingMode === "user";

  // 1. Cargar el modelo de IA
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm", // Cargamos el motor del modelo
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", // Cargamos el modelo
            delegate: "GPU",
          },
          minPoseDetectionConfidence: confidence_threshold,
          minPosePresenceConfidence: confidence_threshold,
          minTrackingConfidence: confidence_threshold,
          runningMode: "VIDEO",
          numPoses: 1,
        });
        console.log("Confidence Threshold:", confidence_threshold);

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

  // 2. Loop de Detección
  useEffect(() => {
    if (!isModelLoaded || !webcamRunning) return;

    const predictWebcam = () => {
      if (
        poseLandmarkerRef.current &&
        webcamRef.current &&
        webcamRef.current.video
      ) {
        const video = webcamRef.current.video;

        // OPTIMIZACIÓN DE FRAME:
        // Verificamos dimensiones > 0 para evitar errores al cambiar de cámara
        const isValidFrame =
          video.readyState === 4 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0;

        if (isValidFrame) {
          // Nos aseguramos que el video esté listo y que no haya un frame vacío
          const canvas = canvasRef.current;
          if (canvas) {
            // Ajustamos tamaño interno del canvas al video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const startTimeMs = performance.now();

            // Try/Catch interno para evitar que un frame corrupto rompa el loop
            try {
              const results: PoseLandmarkerResult =
                poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

              let finalLandmarks = null;

              if (results.landmarks && results.landmarks.length > 0) {
                const rawLandmarks = results.landmarks[0]; // Tomamos solo el primer humano detectado

                // Si tenemos historia previa, aplicamos suavizado
                if (prevLandmarksRef.current) {
                  finalLandmarks = rawLandmarks.map((point, index) => {
                    const prevPoint = prevLandmarksRef.current![index];
                    return {
                      x: lerp(prevPoint.x, point.x, smoothingFactor),
                      y: lerp(prevPoint.y, point.y, smoothingFactor),
                      z: lerp(prevPoint.z, point.z, smoothingFactor),
                      visibility: point.visibility,
                    };
                  });
                } else {
                  // Si es el primer frame, no hay suavizado posible
                  finalLandmarks = rawLandmarks;
                }

                // Guardamos los puntos suavizados para el siguiente frame
                prevLandmarksRef.current = finalLandmarks;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  const drawingUtils = new DrawingUtils(ctx);

                  if (finalLandmarks) {
                    // Dibujar Conexiones
                    drawingUtils.drawConnectors(
                      finalLandmarks,
                      MY_CONNECTIONS,
                      {
                        color: "#ff5722",
                        lineWidth: 4,
                      },
                    );

                    // Dibujar Puntos
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
                // Si no detecta nada, reseteamos la historia para que no salte
                prevLandmarksRef.current = null;
              }
            } catch (error) {
              console.error("Error procesando frame:", error);
            }
          }
        } else {
          // Limpieza visual si el frame no es válido
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam); // Llamado a predictWebcam antes del siguiente render
    };

    requestRef.current = requestAnimationFrame(predictWebcam);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current); // En caso de desmontar, cancelamos la animación
    };
  }, [smoothingFactor, isModelLoaded, webcamRunning, facingMode]);

  // HANDLERS
  const handleUserMedia = () => {
    console.log("Cámara detectada y autorizada");
    setCameraPermission(true);
    setWebcamRunning(true);
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Error de cámara:", error);
    setCameraPermission(false);
    setWebcamRunning(false);
  };

  // Función para cambiar de cámara
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="relative w-full h-[85vh] md:h-auto md:max-w-4xl md:aspect-video mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
      {/* 1. Loading IA */}
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#2a2a2a] text-white">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">
            Cargando Motores Neuronales...
          </p>
        </div>
      )}

      {/* 2. Error */}
      {isModelLoaded && cameraPermission === false && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <CameraOff className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Acceso a cámara denegado</h3>
          <p className="text-white/60 mb-6 max-w-md">
            Por favor permite el acceso a la cámara.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Recargar
          </button>
        </div>
      )}

      {/* 3. Webcam */}
      <Webcam
        ref={webcamRef}
        mirrored={isMirrored} // Espejo dinámico
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        // --- OPTIMIZACIÓN DE PÍXELES ---
        // Forzamos resolución VGA (640x480).
        videoConstraints={{
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        }}
        // -------------------------------
        disablePictureInPicture={true}
        controls={false}
        playsInline={true}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Canvas con espejo condicional */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
          isMirrored ? "transform -scale-x-100" : ""
        }`}
      />

      {/* 4. Indicador LIVE */}
      {webcamRunning && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-white/80">VECTRA VISION</span>
        </div>
      )}

      {/* 5. BOTÓN CAMBIAR CÁMARA  */}
      {webcamRunning && (
        <button
          onClick={toggleCamera}
          className="absolute bottom-6 right-6 z-40 p-4 bg-primary/80 hover:bg-primary text-white rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95"
          title="Cambiar Cámara"
        >
          <SwitchCamera className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
