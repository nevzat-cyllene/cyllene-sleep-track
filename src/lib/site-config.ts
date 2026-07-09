import type { Metadata, Viewport } from "next";

export const siteConfig = {
  /** Ana marka adı — Türkçe arayüzde her yerde */
  name: "Cyllene Uyku Takipçisi",
  /** Kısa ad — PWA, sidebar, ikon altı */
  shortName: "Cyllene",
  /** İngilizce alt başlık / teknik ad */
  tagline: "Cyllene Sleep Track",
  /** npm paket ve repo adı */
  packageName: "cyllene-sleep-track",
  description:
    "Uykunuzu telefonunuzda ses analizi ile izleyin. Horlama, öksürük ve gürültü olaylarını sabah raporunda görün.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const defaultViewport: Viewport = {
  themeColor: "#0f0a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
