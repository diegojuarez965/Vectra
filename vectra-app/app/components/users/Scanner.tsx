"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver, // Componente necesario para cargar los binarios de WASM
  PoseLandmarker, // Clase principal del Modelo de Detección
  PoseLandmarkerResult, // Tipo de dato para los resultados
  DrawingUtils, // Herramientas de Google para dibujar líneas
} from "@mediapipe/tasks-vision";
import { Loader2, CameraOff, RefreshCw, SwitchCamera } from "lucide-react";

// --- CONFIGURACIÓN DEL ESQUELETO ---
// Definimos manualmente qué puntos conectar para evitar dibujar la cara o manos
// (Hombros, Brazos, Torso, Piernas)
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

// Lista de índices de puntos individuales que queremos resaltar (Círculos blancos)
const RELEVANT_LANDMARKS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

export default function Scanner() {
  // --- REFERENCIAS (Persisten sin re-renderizar) ---
  const webcamRef = useRef<Webcam>(null); // Acceso directo al elemento <video>
  const canvasRef = useRef<HTMLCanvasElement>(null); // Acceso al lienzo de dibujo
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Instancia de la IA
  const requestRef = useRef<number>(0); // ID de la animación (requestAnimationFrame)
  
  // OPTIMIZACIÓN 2: THROTTLING (Limitador de FPS)
  // Guardamos el timestamp de la última vez que la IA procesó un frame
  const lastProcessTimeRef = useRef<number>(0); 

  // --- ESTADOS (Provocan re-render visual) ---
  const [isModelLoaded, setIsModelLoaded] = useState(false); // ¿Ya cargó Google MediaPipe?
  const [webcamRunning, setWebcamRunning] = useState(false); // ¿La cámara está enviando video?
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null); // Estado de permisos

  // Control de cámara trasera/frontal ("user" = selfie, "environment" = trasera)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Calculamos si debemos espejar la imagen (Solo espejamos si es la frontal)
  const isMirrored = facingMode === "user";

  // --------------------------------------------------------------------------
  // EFECTO 1: CARGA INICIAL DEL MODELO
  // --------------------------------------------------------------------------
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        // 1. Descargar el motor WASM (WebAssembly)
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        // 2. Configurar el modelo neuronal
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU", // Usamos GPU para aceleración de hardware
          },
          runningMode: "VIDEO", // Optimizado para flujo continuo (usa info temporal del frame anterior)
          numPoses: 1, // Solo detectamos a 1 persona a la vez
          
          // OPTIMIZACIÓN 3: Bajar la confianza mínima
          // 0.5 es un balance bueno: detecta rápido sin ser demasiado exigente
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        
        poseLandmarkerRef.current = landmarker;
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error cargando modelo:", error);
      }
    };
    createPoseLandmarker();
    
    // Cleanup: Limpiar memoria al desmontar
    return () => {
      poseLandmarkerRef.current?.close();
    };
  }, []);

  // --------------------------------------------------------------------------
  // EFECTO 2: BUCLE DE DETECCIÓN (LOOP)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isModelLoaded || !webcamRunning) return;

    const predictWebcam = () => {
      // Verificamos que todas las referencias existan
      if (
        poseLandmarkerRef.current &&
        webcamRef.current &&
        webcamRef.current.video
      ) {
        const video = webcamRef.current.video;
        const now = performance.now();

        // --- LÓGICA DE THROTTLING (OPTIMIZACIÓN CLAVE) ---
        // Limitamos la IA a 15 FPS para no quemar el procesador en móviles gama baja.
        // La cámara se verá fluida (30/60fps), pero el esqueleto se actualizará a 15fps.
        const FRAME_RATE_LIMIT = 15; 
        const MIN_TIME_BETWEEN_FRAMES = 1000 / FRAME_RATE_LIMIT;

        if (now - lastProcessTimeRef.current >= MIN_TIME_BETWEEN_FRAMES) {
            
            // VALIDACIÓN DE FRAME:
            // Aseguramos que el video tenga dimensiones reales (> 0)
            // Esto evita el crash "ROI width > 0" al cambiar de cámara
            const isValidFrame = video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0;

            if (isValidFrame) {
                // Actualizamos el tiempo de último proceso
                lastProcessTimeRef.current = now;

                const canvas = canvasRef.current;
                if (canvas) {
                    // Sincronizamos tamaño del canvas con el video
                    // (Será 640x480 aprox debido a constraints)
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const startTimeMs = performance.now();

                    // --- BLOQUE TRY/CATCH PARA ROBUSTEZ ---
                    // En móviles viejos, a veces WebGL falla un frame. 
                    // El try/catch evita que la app se cierre, simplemente ignora ese frame.
                    try {
                        const results: PoseLandmarkerResult =
                        poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            if (results.landmarks) {
                                const drawingUtils = new DrawingUtils(ctx);
                                for (const landmark of results.landmarks) {
                                    // 1. Dibujar Conexiones (Líneas Naranjas)
                                    drawingUtils.drawConnectors(landmark, MY_CONNECTIONS, {
                                        color: "#ff5722",
                                        lineWidth: 4,
                                    });

                                    // 2. Dibujar Puntos (Círculos Blancos)
                                    // Iteramos manualmente nuestra lista filtrada
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
                    } catch (error) {
                        console.warn("Frame saltado debido a error de WebGL u otro:", error);
                    }
                }
            } else {
                 // Si el frame no es válido (ej: durante el cambio de cámara),
                 // limpiamos el canvas para no dejar un "esqueleto fantasma" congelado.
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext("2d");
                if (canvas && ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
        // NOTA: Si entramos al "Throttle" (saltamos el frame), NO limpiamos el canvas.
        // Esto permite persistencia visual y evita parpadeos.
      }
      // Solicitamos el siguiente frame al navegador
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    // Iniciamos el bucle
    requestRef.current = requestAnimationFrame(predictWebcam);
    
    // Cleanup: Cancelar animación al desmontar
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isModelLoaded, webcamRunning, facingMode]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  
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

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // --------------------------------------------------------------------------
  // RENDER (JSX)
  // --------------------------------------------------------------------------
  return (
    // CONTENEDOR PRINCIPAL
    // Móvil: h-[85vh] (Vertical alto)
    // Desktop: aspect-video (16:9 apaisado)
    <div className="relative w-full h-[85vh] md:h-auto md:max-w-4xl md:aspect-video mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
      
      {/* 1. ESTADO DE CARGA */}
      {!isModelLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#2a2a2a] text-white">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">
            Cargando Motores Neuronales...
          </p>
        </div>
      )}

      {/* 2. ESTADO DE ERROR / PERMISOS */}
      {isModelLoaded && cameraPermission === false && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <CameraOff className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Acceso a cámara denegado</h3>
          <p className="text-white/60 mb-6 max-w-md">
            Por favor permite el acceso a la cámara y recarga.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Recargar
          </button>
        </div>
      )}

      {/* 3. COMPONENTE WEBCAM */}
      <Webcam
        ref={webcamRef}
        mirrored={isMirrored} // Espejo dinámico según cámara
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        
        // --- OPTIMIZACIÓN 1: RESOLUCIÓN VGA ---
        // Forzamos resolución 640x480. 
        // Esto reduce en un 75% la cantidad de píxeles que la IA debe procesar vs HD.
        // Es la clave para que funcione en Samsung J4 / Gama baja.
        videoConstraints={{
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        }}
        // -------------------------------------
        
        disablePictureInPicture={true}
        controls={false}
        playsInline={true}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 4. CANVAS DE DIBUJO (CAPA TRANSPARENTE) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
          isMirrored ? "transform -scale-x-100" : ""
        }`}
      />

      {/* 5. INDICADOR DE ESTADO "LIVE" */}
      {webcamRunning && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-white/80">VECTRA VISION</span>
        </div>
      )}

      {/* 6. BOTÓN FLOTANTE PARA CAMBIAR CÁMARA */}
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