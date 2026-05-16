import type { Metadata } from "next"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import "leaflet/dist/leaflet.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geistMonoHeading = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
})

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://carigas.my"),
  applicationName: "carigas.my",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ms"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable,
        geistMonoHeading.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
