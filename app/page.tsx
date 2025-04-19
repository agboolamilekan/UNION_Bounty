"use client"

import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { GraphVisualization } from "@/components/graph-visualization"
import { fetchVouchingData } from "@/lib/api"
import type { GraphData } from "@/lib/types"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Initialize Farcaster client and fetch data
    const initAndFetch = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === "undefined") return

        let fid = null

        // Try to get Farcaster client
        try {
          // @ts-ignore - Farcaster client is injected by Warpcast
          const client = window.farcaster?.getClient()
          if (client) {
            const { data: userData } = await client.fetchCurrentUser()
            fid = userData?.fid?.toString() || null
            setCurrentUser(fid)
          }
        } catch (e) {
          console.log("Farcaster client not available:", e)
        }

        // Fetch vouching data
        const data = await fetchVouchingData()

        // Process the data to ensure it's in the correct format
        const processedData = {
          nodes: data.nodes.map((node) => ({
            ...node,
            // Ensure id is a string
            id: String(node.id),
          })),
          links: data.links.map((link) => ({
            ...link,
            // Ensure id is a string
            id: String(link.id),
            // Ensure source and target are strings
            source: String(typeof link.source === "object" ? link.source.id : link.source),
            target: String(typeof link.target === "object" ? link.target.id : link.target),
          })),
        }

        setGraphData(processedData)
      } catch (err) {
        console.error("Error initializing:", err)
        setError("Failed to initialize. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    initAndFetch()
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return null
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!graphData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Could not retrieve vouching graph data. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Union Vouching Graph</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Interactive visualization of Union vouching relationships
      </p>

      <div className="w-full h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <GraphVisualization data={graphData} currentUser={currentUser} />
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Click on a node to see its connections highlighted
      </div>
    </main>
  )
}
