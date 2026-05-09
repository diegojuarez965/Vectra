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

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

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

  // 2. Rutas de la API
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

  // 3. Componentes internos de Next.js, imágenes y navegación
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
