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
    icon: "/icon-192x192.png",
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