"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { GraphVisualization } from "@/components/graph-visualization"
import { fetchVouchingData } from "@/lib/api"
import type { GraphData } from "@/lib/types"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Farcaster client
    const initFarcaster = async () => {
      try {
        // @ts-ignore - Farcaster client is injected by Warpcast
        const client = window.farcaster?.getClient()

        if (!client) {
          setError("Farcaster client not found. Please open in Warpcast.")
          setIsLoading(false)
          return
        }

        // Get current user
        const { data: userData } = await client.fetchCurrentUser()
        setCurrentUser(userData?.fid?.toString() || null)

        // Fetch vouching data
        const data = await fetchVouchingData()
        setGraphData(data)
      } catch (err) {
        console.error("Error initializing:", err)
        setError("Failed to initialize. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    initFarcaster()
  }, [])

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
