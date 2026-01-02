import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { BackendInitializer } from "@/components/backend-initializer"
import { AlertNotificationSystem } from "@/components/alert-notification-system"
import "./globals.css"

export const metadata: Metadata = {
  title: "Service Monitor - Monitoramento em Tempo Real",
  description: "Sistema profissional de monitoramento de serviços para verificar status, uptime e performance",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <BackendInitializer />
          <AlertNotificationSystem />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
