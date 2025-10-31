import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Sidebar from "@/components/sidebar"

export const metadata: Metadata = {
  title: "AInode Dashboard",
  description: "AI-powered learning and career development platform",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 min-h-screen`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto md:ml-72">
              <div className="p-4 md:p-6">{children}</div>
            </main>
          </div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
