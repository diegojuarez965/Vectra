import { useCallback, useEffect, useRef } from "react";

export const useTextToSpeech = () => {
  const queueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const currentTextRef = useRef<string | null>(null);

  const processQueueRef = useRef<() => void>(() => { });

  // Procesa la cola de mensajes de forma secuencial
  const processQueue = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    // Sincronizar el estado interno con la API nativa
    if (!window.speechSynthesis.speaking && isSpeakingRef.current) {
      isSpeakingRef.current = false;
      currentTextRef.current = null;
    }

    if (isSpeakingRef.current || queueRef.current.length === 0) {
      return;
    }

    const nextText = queueRef.current.shift();
    if (!nextText) return;

    isSpeakingRef.current = true;
    currentTextRef.current = nextText;

    const utterance = new SpeechSynthesisUtterance(nextText);

    // Configuración
    utterance.lang = "es-ES"; // Español
    utterance.rate = 1.0; // Velocidad normal
    utterance.pitch = 1.0; // Tono normal
    utterance.volume = 1.0; // Volumen máximo

    utterance.onend = () => {
      isSpeakingRef.current = false;
      currentTextRef.current = null;
      processQueueRef.current();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      currentTextRef.current = null;
      processQueueRef.current();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Función para cancelar la síntesis y limpiar la cola
  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) {
      queueRef.current = [];
      isSpeakingRef.current = false;
      currentTextRef.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  // Función para hablar
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Este navegador no soporta Text-to-Speech");
      return;
    }

    // Evitar encolar el mismo mensaje si ya se está reproduciendo o está en espera
    if (currentTextRef.current === text || queueRef.current.includes(text)) {
      return;
    }

    // Limitar la cola a un máximo de 3 mensajes para evitar saturación acumulada
    if (queueRef.current.length >= 3) {
      queueRef.current.shift();
    }

    queueRef.current.push(text);
    processQueue();
  }, [processQueue]);

  return { speak, cancel };
};
