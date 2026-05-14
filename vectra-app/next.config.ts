import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Configuramos las opciones principales del Service Worker
const withSerwist = withSerwistInit({
  // La ruta del sw
  swSrc: "app/sw.ts",
  // La ruta del archivo final compilado para que el navegador lo lea
  swDest: "public/sw.js",
  // Desactivamos el SW en desarrollo para que no interfiera con pruebas locales
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  /* Permite que nextjs descargue imagenes de las siguientes fuentes */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "amzn-s3-vectra.s3.sa-east-1.amazonaws.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
