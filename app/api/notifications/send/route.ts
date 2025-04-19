import { type NextRequest, NextResponse } from "next/server"

// This endpoint allows you to send notifications to users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, message, url } = body

    if (!token || !message) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // In a real implementation, you would validate the request
    // and ensure only authorized sources can send notifications

    // Send notification to Farcaster
    const response = await fetch("https://api.warpcast.com/v2/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        title: "Union Vouching Graph",
        body: message,
        url: url || "https://union-vouching-graph.vercel.app",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${JSON.stringify(result)}`)
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
