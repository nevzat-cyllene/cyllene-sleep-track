import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultMetadata, defaultViewport } from "@/lib/site-config";
import { Providers } from "@/components/providers";
import { parseLocale } from "@/i18n/locales";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;
export const viewport = defaultViewport;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get("cyllene.locale")?.value);

  return (
    <html
      lang={initialLocale === "ku" ? "ku" : initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-512.png" type="image/png" sizes="512x512" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.__cylleneBIPBound)return;window.__cylleneBIPBound=1;var ua=navigator.userAgent||"";var embed=/\\bwv\\b|; wv\\)|Instagram|FBAN|FBAV|Vercel/i.test(ua);if(embed)return;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__cylleneBIP=e;},true);})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
