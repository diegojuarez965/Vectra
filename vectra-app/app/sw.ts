/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  SerwistGlobalConfig,
  RuntimeCaching,
} from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Definición de las reglas de caché
const customCaching: RuntimeCaching[] = [
  // 1. Modelos de MediaPipe
  // Estrategia: Cache First
  {
    matcher: ({ url }) => {
      return (
        url.pathname.endsWith(".task") ||
        url.pathname.endsWith(".wasm") ||
        url.hostname === "cdn.jsdelivr.net" ||
        url.hostname === "storage.googleapis.com"
      );
    },
    handler: new CacheFirst({
      cacheName: "vectra-cv-models",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200], // 0 es necesario para peticiones cross-origin opacas
        }),
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // Mantenemos en caché por 30 días
          purgeOnQuotaError: true, // Si no hay espacio, borra las entradas más antiguas
        }),
      ],
    }),
  },

  // 2. Fotos de perfil del usuario (Cloudinary)
  // Estrategia: Network First (para mostrar siempre la última foto subida si hay conexión)
  {
    matcher: ({ url }) => url.hostname === "res.cloudinary.com",
    handler: new NetworkFirst({
      cacheName: "vectra-profile-pictures",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // Mantenemos en caché por 7 días
        }),
      ],
    }),
  },

  // 3. Rutas de la API
  // Estrategia: Network First
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: "vectra-api-calls",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // Mantenemos en caché por 30 días para no perder la sesión offline
        }),
      ],
      networkTimeoutSeconds: 5, // Si el servidor no responde en 5 segundos, sirve el caché
    }),
  },

  // 4. Componentes internos de Next.js, imágenes y navegación
  // Mantenemos la estrategia por defecto de Next.js.
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customCaching,
});

serwist.addEventListeners();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializamos Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Escuchamos los mensajes en segundo plano
onBackgroundMessage(messaging, (payload) => {
  console.log("Recibido mensaje en segundo plano:", payload);

  const notificationTitle =
    payload.notification?.title || "Notificación de Vectra";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes un nuevo mensaje.",
    icon: "/images/vectra-logo-512x512.png",
    badge: "/images/vectra-logo-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
