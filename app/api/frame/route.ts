import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Log the request for debugging
    console.log("Frame request:", body)

    // Return a frame response that redirects to the main app
    return NextResponse.json({
      image: "https://union-vouching-graph.vercel.app/api/og",
      buttons: [
        {
          label: "View Interactive Graph",
          action: "post_redirect",
        },
      ],
      post_url: "https://union-vouching-graph.vercel.app",
    })
  } catch (error) {
    console.error("Error processing frame action:", error)
    return NextResponse.json({ error: "Failed to process frame action" }, { status: 500 })
  }
}
