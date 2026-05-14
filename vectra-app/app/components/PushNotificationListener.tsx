"use client";

import { useEffect, useState } from "react";
import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import { app } from "@/app/lib/firebase";
import { X, Bell } from "lucide-react";

export default function PushNotificationListener() {
  const [notification, setNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          const supported = await isSupported();

          if (supported) {
            const messaging = getMessaging(app);

            // onMessage escucha los mensajes push cuando la pestaña está activa (foreground)
            unsubscribe = onMessage(messaging, (payload) => {
              console.log("Mensaje recibido en foreground:", payload);
              if (payload.notification) {
                setNotification({
                  title: payload.notification.title || "Nueva Notificación",
                  body: payload.notification.body || "Tienes un nuevo mensaje.",
                });

                // Auto-ocultar el toast después de 10 segundos
                setTimeout(() => {
                  setNotification(null);
                }, 10000);
              }
            });
          }
        }
      } catch (error) {
        console.error(
          "Error al configurar listener de notificaciones foreground:",
          error,
        );
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-9999 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-2xl rounded-xl p-4 w-80 max-w-[calc(100vw-2rem)] flex gap-4">
        <div className="mt-1 bg-primary/10 text-primary rounded-full p-2 h-fit">
          <Bell className="w-5 h-5 animate-[wiggle_1s_ease-in-out_infinite]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">
            {notification.title}
          </h3>
          <p className="text-foreground/80 text-xs mt-1">{notification.body}</p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="text-foreground/50 hover:text-foreground transition-colors h-fit"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
