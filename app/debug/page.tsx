"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [farcasterInfo, setFarcasterInfo] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    addLog("Debug page loaded")

    // Check if Farcaster client is available
    if (typeof window !== "undefined") {
      addLog(`Window object exists: ${typeof window}`)
      addLog(`Farcaster object exists: ${typeof window.farcaster}`)

      if (window.farcaster) {
        try {
          const client = window.farcaster.getClient()
          addLog(`Farcaster client available: ${!!client}`)

          if (client) {
            client
              .fetchCurrentUser()
              .then((result: any) => {
                addLog(`User fetch result: ${JSON.stringify(result)}`)
                setFarcasterInfo(result.data)
              })
              .catch((err: any) => {
                addLog(`Error fetching user: ${err.message}`)
              })
          }
        } catch (e: any) {
          addLog(`Error accessing Farcaster client: ${e.message}`)
        }
      }
    }
  }, [])

  function addLog(message: string) {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <p>User Agent: {navigator.userAgent}</p>
          <p>Farcaster Available: {typeof window !== "undefined" && !!window.farcaster ? "Yes" : "No"}</p>
        </div>
      </div>

      {farcasterInfo && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Farcaster User</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(farcasterInfo, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              addLog("Testing fetch...")
              fetch("/api/vouching-data")
                .then((res) => res.json())
                .then((data) => {
                  addLog(`Fetch successful: ${data.nodes.length} nodes`)
                })
                .catch((err) => {
                  addLog(`Fetch error: ${err.message}`)
                })
            }}
          >
            Test API Fetch
          </Button>

          <Button
            onClick={() => {
              addLog("Reloading page...")
              window.location.reload()
            }}
          >
            Reload Page
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Logs</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded h-80 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="font-mono text-sm mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => (window.location.href = "/")}>Back to Main App</Button>
      </div>
    </div>
  )
}
