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
  // Sample Farcaster names and ENS names
  const fcastNames = [
    "vitalik.eth",
    "dwr.eth",
    "punk6529",
    "naval",
    "balajis",
    "cdixon",
    "jessewldn",
    "varun",
    "paul",
    "linda",
    "packy",
    "brian",
    "jason",
    "pomp",
    "shl",
  ]

  const ensNames = [
    "vitalik.eth",
    "nick.eth",
    "avsa.eth",
    "ricmoo.eth",
    "brantly.eth",
    "sassal.eth",
    "0age.eth",
    "0xstark.eth",
    "0xmaki.eth",
    "0xngmi.eth",
    "0xshual.eth",
    "0xiam.eth",
    "0xdefi.eth",
    "0xbitcoin.eth",
    "0xdai.eth",
  ]

  const nodes = []
  const links = []

  // Generate some random nodes with realistic names
  for (let i = 1; i <= 50; i++) {
    const useFname = i % 3 === 0
    const useEns = i % 3 === 1

    nodes.push({
      id: `user${i}`,
      name: `User ${i}`,
      fname: useFname ? fcastNames[i % fcastNames.length] : undefined,
      ens: useEns ? ensNames[i % ensNames.length] : undefined,
      fid: `${1000 + i}`,
      img: i % 5 === 0 ? `/placeholder.svg?height=100&width=100` : undefined,
    })
  }

  // Generate some random connections
  for (let i = 1; i <= 100; i++) {
    const source = Math.floor(Math.random() * 50) + 1
    let target = Math.floor(Math.random() * 50) + 1

    // Ensure source and target are different
    while (source === target) {
      target = Math.floor(Math.random() * 50) + 1
    }

    links.push({
      id: `link${i}`,
      source: `user${source}`,
      target: `user${target}`,
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    })
  }

  return { nodes, links }
}
