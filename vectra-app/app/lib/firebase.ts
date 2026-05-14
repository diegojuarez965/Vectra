// app/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  deleteToken,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita inicializar Firebase múltiples veces en desarrollo
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const requestNotificationPermission = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Este navegador no soporta notificaciones push.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const messaging = getMessaging(app);

      // Esperamos a que el Service Worker de Serwist esté listo
      const swRegistration = await navigator.serviceWorker.ready;

      // Obtenemos el token FCM y lo asociamos al Service Worker de Serwist
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        console.log("Token FCM obtenido:", currentToken);
        return currentToken;
      } else {
        console.warn("No se pudo obtener el token de FCM.");
        return null;
      }
    } else {
      console.warn("El usuario denegó el permiso para notificaciones.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener permiso o token:", error);
    return null;
  }
};

export const unsubscribeFromNotifications = async () => {
  try {
    const supported = await isSupported();
    if (!supported) return false;

    const messaging = getMessaging(app);

    // Obtenemos el Service Worker de Serwist
    const swRegistration = await navigator.serviceWorker.ready;

    // Obtenemos el token FCM desde el navegador y lo asociamos a Serwist (guardamos esto en la configuración interna de messaging)
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    // Usamos deleteToken pasándole el parámetro 'messaging'
    const deleted = await deleteToken(messaging);

    if (deleted) {
      console.log("Token FCM eliminado y desuscrito correctamente.");
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error al desuscribirse de notificaciones:", error);
    return null;
  }
};

export { app };
