"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"

interface NotificationManagerProps {
  fid?: string | null
}

export function NotificationManager({ fid }: NotificationManagerProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFarcasterAvailable, setIsFarcasterAvailable] = useState(false)

  useEffect(() => {
    // Check if Farcaster client is available
    if (typeof window !== "undefined" && window.farcaster) {
      setIsFarcasterAvailable(true)
    }
  }, [])

  const handleSubscribe = async () => {
    if (!fid || !isFarcasterAvailable) return

    setIsLoading(true)
    setError(null)

    try {
      // @ts-ignore - Farcaster client is injected by Warpcast
      const client = window.farcaster.getClient()

      if (!client) {
        throw new Error("Farcaster client not available")
      }

      // Request notification permissions
      const result = await client.requestNotificationPermission()

      if (result.success) {
        setIsSubscribed(true)
        // In a real app, you would store this in your backend
        console.log("Notification token:", result.data.token)
      } else {
        throw new Error(result.error || "Failed to subscribe to notifications")
      }
    } catch (err: any) {
      console.error("Error subscribing to notifications:", err)
      setError(err.message || "Failed to subscribe to notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    // In a real implementation, you would call your backend to remove the token
    setIsSubscribed(false)
  }

  if (!isFarcasterAvailable || !fid) {
    return null
  }

  return (
    <div className="mb-4">
      {isSubscribed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnsubscribe}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <BellOff className="h-4 w-4" />
          Unsubscribe from updates
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSubscribe}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Get notified of updates
        </Button>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
