"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, BellOff, Loader2 } from "lucide-react";
import {
  requestNotificationPermission,
  unsubscribeFromNotifications,
} from "@/app/lib/firebase";
import {
  subscribeToNotifications,
  removeNotificationSubscription,
} from "@/app/lib/actions";
import { verifyNotificationSubscription } from "@/app/lib/data";

export default function NotificationButton({ userID }: { userID: string }) {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator
      ) {
        // Si el permiso no está otorgado, es imposible que esté suscrito
        if (Notification.permission !== "granted") {
          setIsSubscribed(false);
        } else {
          try {
            // Obtenemos el token almacenado en este navegador
            const token = await requestNotificationPermission();

            if (token) {
              // Verificamos en el servidor si este token le pertenece a este userID
              const res = await verifyNotificationSubscription(token, userID);
              setIsSubscribed(res.isSubscribed);
            } else {
              setIsSubscribed(false);
            }
          } catch (error) {
            console.error(
              "Error al verificar la suscripción en el backend:",
              error,
            );
            setIsSubscribed(false);
          }
        }
      }
      setLoading(false);
    };

    checkSubscriptionStatus();
  }, [userID]);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSubscribed) {
        const token = await unsubscribeFromNotifications();
        if (typeof token === "string") {
          const res = await removeNotificationSubscription(token, userID);
          if (res.success) {
            setIsSubscribed(false);
          } else {
            setError(res.message);
          }
        } else {
          setError("Error al desuscribir en el navegador");
        }
      } else {
        const token = await requestNotificationPermission();
        if (typeof token === "string") {
          const res = await subscribeToNotifications(token, userID);
          if (res.success) {
            setIsSubscribed(true);
          } else {
            setError(res.message);
          }
        } else {
          setError("Error al activar las notificaciones en el navegador");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = isSubscribed
    ? isHovered
      ? "bg-foreground/10 text-foreground border-foreground/20 hover:bg-foreground/20"
      : "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,87,34,0.15)]"
    : "bg-foreground/5 text-foreground border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20";

  const renderIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isSubscribed) {
      return isHovered ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <BellRing className="h-4 w-4" />
      );
    }
    return (
      <Bell className="h-4 w-4 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
    );
  };

  const renderText = () => {
    if (loading) return "Cargando...";
    if (error) return error;
    if (isSubscribed) {
      return isHovered ? "Desactivar Notificaciones" : "Notificaciones Activas";
    }
    return "Activar Notificaciones";
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2 text-sm font-medium border transition-all duration-300 cursor-pointer ${buttonStyle}`}
      aria-label={
        isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"
      }
    >
      {renderIcon()}
      <span>{renderText()}</span>
    </button>
  );
}
