import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AppRouter } from "@/components/navigation/app-router"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoffeeDocket 2.0",
  description: "Track your perfect brew with advanced coffee management",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CoffeeDocket'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/icons/web/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/web/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/web/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CoffeeDocket" />
        <link rel="apple-touch-icon" href="/icons/web/apple-touch-icon.png" />
        <meta name="theme-color" content="#283593" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/supabase/2.38.0/supabase.min.js" async />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
