import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // This is a test endpoint to check if the API routes are working
  return NextResponse.json({
    status: "ok",
    message: "Notification test endpoint is working",
    timestamp: new Date().toISOString(),
  })
}
