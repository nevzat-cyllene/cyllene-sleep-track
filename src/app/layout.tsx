import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultMetadata, defaultViewport } from "@/lib/site-config";
import { Providers } from "@/components/providers";
import { detectLocaleFromAcceptLanguage, isLocale } from "@/i18n/locales";
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
  const headerStore = await headers();
  const cookieLocale = cookieStore.get("cyllene.locale")?.value;
  const initialLocale = isLocale(cookieLocale)
    ? cookieLocale
    : detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));

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
            __html: `(function(){try{if(document.cookie.split(";").some(function(p){return p.trim().indexOf("cyllene.locale=")===0;}))return;var tag=((Intl.DateTimeFormat().resolvedOptions().locale)||"").toLowerCase();var next="tr";if(tag.indexOf("en")===0)next="en";else if(tag.indexOf("tr")===0)next="tr";else if(tag.indexOf("ku")===0||tag.indexOf("ckb")===0||tag.indexOf("kmr")===0)next="ku";else{var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<langs.length;i++){var l=(langs[i]||"").toLowerCase();if(l.indexOf("tr")===0){next="tr";break;}if(l.indexOf("en")===0){next="en";break;}if(l.indexOf("ku")===0||l.indexOf("ckb")===0||l.indexOf("kmr")===0){next="ku";break;}}}document.cookie="cyllene.locale="+next+"; path=/; max-age=31536000; samesite=lax";document.documentElement.lang=next==="ku"?"ku":next;}catch(e){}})();`,
          }}
        />
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
