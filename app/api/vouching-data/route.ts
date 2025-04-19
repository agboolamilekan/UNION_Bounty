import { NextResponse } from "next/server"
import type { GraphData } from "@/lib/types"

export async function GET() {
  try {
    // In a production app, you would fetch this data from Union's API or a subgraph
    // For example, using a GraphQL query to fetch vouching relationships

    // This is where you would implement the actual data fetching logic
    // For now, we'll return mock data

    const data = await fetchUnionVouchingData()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching vouching data:", error)
    return NextResponse.json({ error: "Failed to fetch vouching data" }, { status: 500 })
  }
}

async function fetchUnionVouchingData(): Promise<GraphData> {
  // Sample data matching the provided graph.json format
  return {
    nodes: [
      {
        id: "user1",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        pfp: "https://via.placeholder.com/50?text=U1",
      },
      {
        id: "user2",
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        pfp: "https://via.placeholder.com/50?text=U2",
      },
      {
        id: "user3",
        address: "0x7890abcdef1234567890abcdef1234567890abcd",
        pfp: "https://via.placeholder.com/50?text=U3",
      },
      {
        id: "user4",
        address: "0x4567890abcdef1234567890abcdef1234567890",
        pfp: "https://via.placeholder.com/50?text=U4",
      },
    ],
    links: [
      { source: "user1", target: "user2" },
      { source: "user2", target: "user3" },
      { source: "user3", target: "user1" },
      { source: "user1", target: "user4" },
    ],
  }
}
