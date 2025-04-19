import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Union Vouching Graph",
  description: "Interactive visualization of Union vouching relationships",
  // Add OpenGraph metadata
  openGraph: {
    title: "Union Vouching Graph",
    description: "Interactive visualization of Union vouching relationships",
    images: [
      {
        url: "https://union-vouching-graph.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "Union Vouching Graph",
      },
    ],
  },
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
        {/* Farcaster Frame metadata */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://union-vouching-graph.vercel.app/api/og" />
        <meta property="fc:frame:button:1" content="View Interactive Graph" />
        <meta property="fc:frame:post_url" content="https://union-vouching-graph.vercel.app/api/frame" />

        {/* Farcaster Mini App metadata */}
        <meta property="og:title" content="Union Vouching Graph" />
        <meta property="og:description" content="Interactive visualization of Union vouching relationships" />
        <meta property="og:image" content="https://union-vouching-graph.vercel.app/api/og" />

        {/* Farcaster Mini App manifest */}
        <link rel="farcaster-app" href="/manifest.json" />

        {/* D3 specific styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .link { stroke: #999; stroke-opacity: 0.6; stroke-width: 1px; }
          .link-highlighted { stroke: #ff4500; stroke-opacity: 1; stroke-width: 2px; }
          .node-label { font-size: 12px; fill: #333; pointer-events: none; }
        `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>

        {/* Add debugging script */}
        <Script id="debug-script" strategy="afterInteractive">
          {`
            console.log("App initialized");
            window.addEventListener('error', function(e) {
              console.error('Global error:', e.message, e.filename, e.lineno);
            });
          `}
        </Script>
      </body>
    </html>
  )
}
