"use client"

import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { D3Graph } from "@/components/d3-graph"
import { FallbackGraph } from "@/components/fallback-graph"
import { NotificationManager } from "@/components/notification-manager"
import { fetchVouchingData } from "@/lib/api"
import type { GraphData } from "@/lib/types"

// Add this to fix the "window is not defined" error during SSR
declare global {
  interface Window {
    farcaster?: any
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [userFid, setUserFid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isFarcasterAvailable, setIsFarcasterAvailable] = useState(false)
  const [useENS, setUseENS] = useState(true)
  const [ensError, setEnsError] = useState<string | null>(null)

  // This useEffect ensures we only run client-side code after mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // This separate useEffect handles Farcaster initialization and data fetching
  useEffect(() => {
    // Skip if not mounted yet (we're still in SSR)
    if (!isMounted) return

    const initAndFetch = async () => {
      try {
        console.log("Initializing app...")
        let fid = null

        // Check if Farcaster client is available
        if (typeof window !== "undefined" && window.farcaster) {
          console.log("Farcaster client detected")
          setIsFarcasterAvailable(true)

          try {
            const client = window.farcaster.getClient()
            if (client) {
              console.log("Getting current user...")
              const { data: userData } = await client.fetchCurrentUser()
              fid = userData?.fid?.toString() || null
              setUserFid(fid)
              console.log("Current user FID:", fid)
            }
          } catch (e) {
            console.error("Error getting Farcaster user:", e)
          }
        } else {
          console.log("Farcaster client not available")
        }

        // Fetch vouching data
        console.log("Fetching vouching data...")
        const data = await fetchVouchingData()
        console.log("Data fetched:", data ? "success" : "failed")

        setGraphData(data)
      } catch (err) {
        console.error("Error initializing:", err)
        setError("Failed to initialize. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    initAndFetch()
  }, [isMounted])

  // Handle ENS resolution errors
  const handleENSError = (error: string) => {
    console.error("ENS resolution error:", error)
    setEnsError(error)
    setUseENS(false)
  }

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
      <h1 className="text-2xl font-bold mb-2">Union Vouching Graph</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Interactive visualization of Union vouching relationships
      </p>

      {!isFarcasterAvailable && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          For the best experience, open this app in Warpcast
        </div>
      )}

      {ensError && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          ENS resolution failed: {ensError}. Using address display instead.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUseENS(true)}
          className={`px-3 py-1 text-sm rounded ${useENS ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Use ENS Resolution
        </button>
        <button
          onClick={() => setUseENS(false)}
          className={`px-3 py-1 text-sm rounded ${!useENS ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Use Addresses
        </button>
      </div>

      <NotificationManager fid={userFid} />

      <div className="w-full h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {useENS ? <D3Graph data={graphData} onError={handleENSError} /> : <FallbackGraph data={graphData} />}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Click on a node to see its connections highlighted and view ENS/Farcaster names
      </div>
    </main>
  )
}
