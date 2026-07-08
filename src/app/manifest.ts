import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CySleep — Uyku Kalitesi Takibi",
    short_name: "CySleep",
    description:
      "Gece uykunuzdaki sesleri cihaz içi analiz ile izleyin. Horlama, öksürük ve gürültü raporları.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0a1a",
    theme_color: "#0f0a1a",
    orientation: "portrait",
    categories: ["health", "lifestyle", "medical"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
