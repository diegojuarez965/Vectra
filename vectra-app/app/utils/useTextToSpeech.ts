import { useCallback } from "react";

export const useTextToSpeech = () => {
  // Función para cancelar la sintesis
  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Función para hablar
  const speak = useCallback((text: string) => {
    // Verificamos si el navegador soporta síntesis de voz
    if ("speechSynthesis" in window) {
      // Cancelamos cualquier audio anterior para evitar colas de mensajes
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configuración
      utterance.lang = "es-ES"; // Español
      utterance.rate = 1.0; // Velocidad normal
      utterance.pitch = 1.0; // Tono normal
      utterance.volume = 1.0; // Volumen máximo

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Este navegador no soporta Text-to-Speech");
    }
  }, []);

  return { speak, cancel };
};
