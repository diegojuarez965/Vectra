"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver, // Componente necesaria para cargar modelos
  PoseLandmarker, // Modelo de Detección de Humanos
  PoseLandmarkerResult, // Tipo de resultado del modelo
  DrawingUtils, // Utilidades para dibujar en canvas
} from "@mediapipe/tasks-vision";
import { Loader2, CameraOff, RefreshCw } from "lucide-react";

// Definimos las conexiones que SÍ nos importan (Cuerpo, Brazos, Piernas)
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

// Lista de índices de puntos individuales que queremos dibujar
// (Hombros, Codos, Muñecas, Caderas, Rodillas, Tobillos)
const RELEVANT_LANDMARKS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

export default function Scanner() {
  // Referencias
  const webcamRef = useRef<Webcam>(null); // Referencia a componente Webcam
  const canvasRef = useRef<HTMLCanvasElement>(null); // Referencia a Canvas para dibujo
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Referencia al modelo
  const requestRef = useRef<number>(0); // Referencia para requestAnimationFrame

  // Estados
  const [isModelLoaded, setIsModelLoaded] = useState(false); // Modelo IA cargado
  const [webcamRunning, setWebcamRunning] = useState(false); // Webcam activa
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  ); // Permiso cámara

  // EFECTOS
  // 1. Cargar el modelo de IA
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm", // Ruta del motor del modelo
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", // Ruta del modelo
            delegate: "GPU", // Usar GPU para mejor rendimiento
          },
          runningMode: "VIDEO", // Modo video para webcam
          numPoses: 1, // Detectar solo una persona
        });
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
  }, []);

  // 2. Loop de Detección
  useEffect(() => {
    if (!isModelLoaded || !webcamRunning) return;

    const predictWebcam = () => {
      // Función de predicción en cada frame
      if (
        poseLandmarkerRef.current && // Modelo cargado
        webcamRef.current && // Componente Webcam cargado
        webcamRef.current.video && // Video cargado
        webcamRef.current.video.readyState === 4 // Video listo
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const startTimeMs = performance.now(); // Obtiene el tiempo actual en ms
          const results: PoseLandmarkerResult =
            poseLandmarkerRef.current.detectForVideo(video, startTimeMs); // Realiza la detección de humanos en el frame actual

          const ctx = canvas.getContext("2d");
          if (ctx && results.landmarks) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const drawingUtils = new DrawingUtils(ctx);

            for (const landmark of results.landmarks) {
              // 1. DIBUJAR SOLO LAS CONEXIONES QUE NOS INTERESAN
              drawingUtils.drawConnectors(landmark, MY_CONNECTIONS, {
                color: "#ff5722",
                lineWidth: 4,
              });

              // 2. DIBUJAR PUNTOS INDIVIDUALES RELEVANTES

              RELEVANT_LANDMARKS.forEach((index) => {
                const point = landmark[index];
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
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam); // Pide que se ejecute predictWebcam antes del próximo repaint
    };

    requestRef.current = requestAnimationFrame(predictWebcam);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }; // Limpieza al desmontar
  }, [isModelLoaded, webcamRunning]);

  // HANDLERS DE CÁMARA

  // Éxito: El navegador dio permisos y hay video
  const handleUserMedia = () => {
    console.log("Cámara detectada y autorizada");
    setCameraPermission(true);
    setWebcamRunning(true);
  };

  //Error: Usuario denegó o no hay cámara
  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Error de cámara:", error);
    setCameraPermission(false);
    setWebcamRunning(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
      {/* 1. Loading IA  */}
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background text-white">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">
            Cargando Motores Neuronales...
          </p>
        </div>
      )}

      {/* 2. Error / Sin Permiso */}
      {isModelLoaded && cameraPermission === false && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <CameraOff className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Acceso a cámara denegado</h3>
          <p className="text-white/60 mb-6 max-w-md">
            Vectra necesita verte para analizar tu postura. Por favor, permite
            el acceso a la cámara en tu navegador y recarga.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Recargar Página
          </button>
        </div>
      )}

      {/* 3. Webcam + Canvas */}
      <Webcam
        ref={webcamRef}
        mirrored={true}
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        // --- BLOQUE DE LIMPIEZA DE INTERFAZ ---
        disablePictureInPicture={true}
        controls={false}
        playsInline={true}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
      />

      {/* 4. Indicador LIVE (Solo si todo funciona) */}
      {webcamRunning && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-white/80">VECTRA VISION</span>
        </div>
      )}
    </div>
  );
}
