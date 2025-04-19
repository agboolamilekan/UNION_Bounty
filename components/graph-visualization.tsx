"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { GraphData } from "@/lib/types"

// Use ForceGraph2D from react-force-graph-2d instead of the full package
// This version doesn't depend on A-Frame
const ForceGraph2D = dynamic(() => import("react-force-graph-2d").then((mod) => mod.default), { ssr: false })

interface GraphVisualizationProps {
  data: GraphData
  currentUser: string | null
}

export function GraphVisualization({ data, currentUser }: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set())
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    window.addEventListener("resize", updateDimensions)
    updateDimensions()

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Handle node selection
  const handleNodeClick = (node: any) => {
    const nodeId = node.id

    if (selectedNode === nodeId) {
      // Deselect if clicking the same node
      setSelectedNode(null)
      setSelectedNodeData(null)
      setHighlightLinks(new Set())
      setHighlightNodes(new Set())
      return
    }

    setSelectedNode(nodeId)
    setSelectedNodeData(node)

    // Find all links connected to this node
    const connectedLinks = new Set<string>()
    const connectedNodes = new Set<string>([nodeId])

    data.links.forEach((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target

      if (sourceId === nodeId || targetId === nodeId) {
        connectedLinks.add(link.id)
        connectedNodes.add(sourceId === nodeId ? targetId : sourceId)
      }
    })

    setHighlightLinks(connectedLinks)
    setHighlightNodes(connectedNodes)
  }

  // Calculate node color based on selection state
  const getNodeColor = (node: any) => {
    if (node.id === currentUser) return "#ff3e00" // Current user
    if (node.id === selectedNode) return "#8b5cf6" // Selected node
    if (highlightNodes.has(node.id)) return "#a78bfa" // Connected node
    return "#94a3b8" // Default color
  }

  // Calculate link color and width based on selection state
  const getLinkColor = (link: any) => {
    return highlightLinks.has(link.id) ? "#8b5cf6" : "#e2e8f0"
  }

  const getLinkWidth = (link: any) => {
    return highlightLinks.has(link.id) ? 3 : 1
  }

  // Get display name for a node (ENS or Farcaster name)
  const getDisplayName = (node: any) => {
    return node.ens || node.fname || node.name || node.id
  }

  if (!isClient) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p>Loading graph visualization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full">
        {isClient && dimensions.width > 0 && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeId="id"
            nodeLabel={(node) => getDisplayName(node)}
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={getLinkColor}
            linkWidth={getLinkWidth}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const { x, y, id } = node
              const size = 6
              const fontSize = 12 / globalScale
              const label = getDisplayName(node)

              // Draw node circle
              ctx.beginPath()
              ctx.arc(x, y, size, 0, 2 * Math.PI)
              ctx.fillStyle = getNodeColor(node)
              ctx.fill()

              // Draw profile picture if available
              if (node.img && globalScale > 0.5) {
                const imgSize = size * 1.8
                const imgX = x - imgSize / 2
                const imgY = y - imgSize / 2

                // Create circular clipping path
                ctx.save()
                ctx.beginPath()
                ctx.arc(x, y, imgSize / 2, 0, 2 * Math.PI)
                ctx.clip()

                // Draw the image
                try {
                  const image = new Image()
                  image.src = node.img
                  image.crossOrigin = "anonymous"
                  ctx.drawImage(image, imgX, imgY, imgSize, imgSize)
                } catch (e) {
                  console.error("Error drawing image:", e)
                }

                ctx.restore()
              }

              // Always draw label for better visibility of ENS/Farcaster names
              ctx.font = `${fontSize}px Sans-Serif`
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"

              // Draw background for text
              const textWidth = ctx.measureText(label).width
              ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
              ctx.fillRect(x - textWidth / 2 - 2, y + size + 2, textWidth + 4, fontSize + 2)

              // Draw text
              ctx.fillStyle = "#000"
              ctx.fillText(label, x, y + size + fontSize / 2 + 2)
            }}
          />
        )}
      </div>

      {/* Node details panel */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold text-lg mb-2">{getDisplayName(selectedNodeData)}</h3>
          {selectedNodeData.ens && <p className="text-sm mb-1">ENS: {selectedNodeData.ens}</p>}
          {selectedNodeData.fname && <p className="text-sm mb-1">Farcaster: {selectedNodeData.fname}</p>}
          {selectedNodeData.fid && <p className="text-sm mb-1">FID: {selectedNodeData.fid}</p>}
          <button
            onClick={() => {
              setSelectedNode(null)
              setSelectedNodeData(null)
              setHighlightLinks(new Set())
              setHighlightNodes(new Set())
            }}
            className="mt-2 text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
