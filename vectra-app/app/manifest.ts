import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vectra - Asistente Virtual de Entrenamiento",
    short_name: "Vectra",
    description:
      "Plataforma avanzada de fitness con IA para corrección postural en tiempo real y rutinas personalizadas.",
    start_url: "/",
    display: "standalone",
    background_color: "#424242",
    theme_color: "#ff5722",
    icons: [
      {
        src: "/images/vectra-logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/vectra-logo-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
