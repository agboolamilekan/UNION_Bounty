import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Union Vouching Graph",
  description: "Interactive visualization of Union vouching relationships",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="https://your-vercel-app.vercel.app/api/og" />
        <meta name="fc:frame:button:1" content="View Graph" />
        <meta property="og:image" content="https://your-vercel-app.vercel.app/api/og" />
        <meta property="fc:frame:post_url" content="https://your-vercel-app.vercel.app/api/frame" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
