import type { GraphData } from "./types"

// This is a placeholder for the actual API call to fetch Union vouching data
export async function fetchVouchingData(): Promise<GraphData> {
  try {
    // In a real implementation, you would fetch this data from Union's API or a subgraph
    // For now, we'll use a mock implementation

    // First try to fetch from our API endpoint
    const response = await fetch("/api/vouching-data")

    if (response.ok) {
      return await response.json()
    }

    throw new Error("Failed to fetch from API")
  } catch (error) {
    console.error("Error fetching vouching data:", error)

    // Fallback to mock data if API fails
    return getMockVouchingData()
  }
}

// Mock data for development and testing
function getMockVouchingData(): GraphData {
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
