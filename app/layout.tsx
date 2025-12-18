import type { Metadata } from "next";
import "./globals.css";
import PWAProvider from "@/component/providers/PWAProvider";

export const metadata: Metadata = {
  title: "Primko - Finance Management",
  description: "Aplikasi manajemen keuangan untuk corps",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Primko",
  },
  icons: {
    icon: "/favicon.ico",
    
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="PRIMKO" />
<link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#155dfc" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>
      <PWAProvider>
        {children}
   </PWAProvider>
        </body>
    </html>
  );
}