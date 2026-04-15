import type { NextConfig } from "next";

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

export default nextConfig;
