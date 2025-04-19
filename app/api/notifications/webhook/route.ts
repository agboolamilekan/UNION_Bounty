import { type NextRequest, NextResponse } from "next/server"

// This endpoint receives webhook events from Farcaster when users enable notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Notification webhook received:", body)

    // The body will contain information about the user who enabled notifications
    // Store this information in your database to send notifications later

    // Example structure of the webhook payload:
    // {
    //   "event": "notification_enabled",
    //   "timestamp": 1234567890,
    //   "user": {
    //     "fid": 1234,
    //     "username": "user.eth",
    //     "display_name": "User Name"
    //   },
    //   "token": "notification-token-to-store"
    // }

    // In a real implementation, you would store the token in your database
    // associated with the user's FID

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing notification webhook:", error)
    return NextResponse.json({ error: "Failed to process notification webhook" }, { status: 500 })
  }
}
