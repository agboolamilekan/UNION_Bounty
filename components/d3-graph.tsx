"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { ethers } from "ethers"

interface GraphNode {
  id: string
  name?: string
  ens?: string
  fname?: string
  address?: string
  img?: string
  pfp?: string
}

interface GraphLink {
  id?: string
  source: string | GraphNode
  target: string | GraphNode
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface D3GraphProps {
  data: GraphData
  onError?: (error: string) => void
}

export function D3Graph({ data, onError }: D3GraphProps) {
  const graphRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!graphRef.current || !data) return

    // Clone the data to avoid mutating the original
    const graphData = {
      nodes: [...data.nodes],
      links: [...data.links].map((link, index) => ({
        ...link,
        // Add an ID if it doesn't exist
        id: link.id || `link-${index}`,
      })),
    }

    // Clear any existing SVG
    d3.select(graphRef.current).select("svg").remove()

    // Set up the SVG canvas
    const width = graphRef.current.clientWidth
    const height = graphRef.current.clientHeight

    const svg = d3.select(graphRef.current).append("svg").attr("width", width).attr("height", height)

    // Create a group for the graph elements
    const g = svg.append("g")

    // Set up zoom behavior
    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.1, 4])
        .on("zoom", ({ transform }: any) => {
          g.attr("transform", transform)
        }) as any,
    )

    // Initialize force simulation
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))

    // Function to resolve ENS names (or fallback to address)
    async function resolveENS(address: string) {
      try {
        // Use the provided Infura API key with explicit network configuration
        const infuraUrl = "https://mainnet.infura.io/v3/d771e24f2c9d4bae839bc2c965b3e10b"

        // Create provider with explicit network configuration
        const provider = new ethers.providers.JsonRpcProvider(infuraUrl, {
          name: "mainnet",
          chainId: 1,
        })

        // Set a timeout for the ENS resolution
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error("ENS resolution timeout")), 3000)
        })

        // Race the ENS resolution against the timeout
        const ensName = await Promise.race([provider.lookupAddress(address), timeoutPromise])

        return ensName || address // Fallback to address if no ENS name
      } catch (error) {
        console.error(`Error resolving ENS for ${address}:`, error)
        if (onError) {
          onError(error instanceof Error ? error.message : String(error))
        }
        return address // Fallback to address on error
      }
    }

    // Process the graph data
    const processData = async () => {
      try {
        // Process nodes to ensure they have names and pfps
        for (const node of graphData.nodes) {
          // Use ENS or fname if available
          if (node.ens) {
            node.name = node.ens
          } else if (node.fname) {
            node.name = node.fname
          }

          // If node has an address but no name, try to resolve ENS
          if (node.address && !node.name) {
            try {
              node.name = await resolveENS(node.address)
            } catch (error) {
              console.error(`Failed to resolve ENS for ${node.address}:`, error)
              node.name = node.address // Fallback to address on error
            }
          }

          // Fallback to ID if no name
          if (!node.name) {
            node.name = node.id
          }

          // Assign a placeholder pfp if none provided
          node.pfp = node.img || node.pfp || `https://via.placeholder.com/50?text=${node.name[0]}`
        }

        // Create links
        const link = g
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graphData.links)
          .enter()
          .append("line")
          .attr("class", "link")

        // Create nodes with images (pfps)
        const node = g.append("g").attr("class", "nodes").selectAll("g").data(graphData.nodes).enter().append("g")

        // Add images for nodes (pfps)
        node
          .append("image")
          .attr("xlink:href", (d: any) => d.pfp)
          .attr("x", -15)
          .attr("y", -15)
          .attr("width", 30)
          .attr("height", 30)
          .attr("clip-path", "circle(15px at 15px 15px)") // Circular clip for pfps
          .attr("crossOrigin", "anonymous") // Add crossOrigin to avoid CORS issues

        // Add labels (ENS or fnames)
        node
          .append("text")
          .attr("class", "node-label")
          .attr("dy", 25)
          .attr("text-anchor", "middle")
          .text((d: any) => d.name)

        // Add click interaction to highlight edges
        node.on("click", (event: any, d: any) => {
          // Reset all links to default style
          link.attr("class", "link")

          // Highlight edges connected to the clicked node
          const connectedLinks = graphData.links.filter(
            (l: any) =>
              (typeof l.source === "object" ? l.source.id === d.id : l.source === d.id) ||
              (typeof l.target === "object" ? l.target.id === d.id : l.target === d.id),
          )

          connectedLinks.forEach((l: any) => {
            const linkSelection = link.filter((ld: any) => {
              const sourceId = typeof ld.source === "object" ? ld.source.id : ld.source
              const targetId = typeof ld.target === "object" ? ld.target.id : ld.target
              const lSourceId = typeof l.source === "object" ? l.source.id : l.source
              const lTargetId = typeof l.target === "object" ? l.target.id : l.target

              return (
                (sourceId === lSourceId && targetId === lTargetId) || (sourceId === lTargetId && targetId === lSourceId)
              )
            })
            linkSelection.attr("class", "link-highlighted")
          })
        })

        // Make nodes draggable
        node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any)

        // Update simulation with nodes and links
        simulation.nodes(graphData.nodes as any)
        simulation.force("link")?.links(graphData.links as any)
        simulation.on("tick", () => {
          link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y)

          node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
        })

        // Drag functions
        function dragstarted(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        }

        function dragged(event: any, d: any) {
          d.fx = event.x
          d.fy = event.y
        }

        function dragended(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }
      } catch (error) {
        console.error("Error processing graph data:", error)
        if (onError) {
          onError(error instanceof Error ? error.message : String(error))
        }
      }
    }

    // Process data and create the graph
    processData().catch((error) => {
      console.error("Error processing graph data:", error)
      if (onError) {
        onError(error instanceof Error ? error.message : String(error))
      }
    })

    // Cleanup function
    return () => {
      simulation.stop()
    }
  }, [data, onError])

  return <div ref={graphRef} className="w-full h-full bg-gray-100 dark:bg-gray-800" />
}
