// Import d3 and ethers libraries
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { ethers } from "https://cdn.ethers.io/lib/ethers-5.7.2.esm.min.js"

// Set up the SVG canvas
const width = window.innerWidth
const height = window.innerHeight

const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height)

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
    .on("zoom", ({ transform }) => {
      g.attr("transform", transform)
    }),
)

// Initialize force simulation
const simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .id((d) => d.id)
      .distance(100),
  )
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2))

// Function to resolve ENS names (or fallback to address)
async function resolveENS(address) {
  try {
    // Use the provided Infura API key with explicit network configuration
    const infuraUrl = "https://mainnet.infura.io/v3/d771e24f2c9d4bae839bc2c965b3e10b"

    // Create provider with explicit network configuration
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl, {
      name: "mainnet",
      chainId: 1,
    })

    // Set a timeout for the ENS resolution
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("ENS resolution timeout")), 3000)
    })

    // Race the ENS resolution against the timeout
    const ensName = await Promise.race([provider.lookupAddress(address), timeoutPromise])

    return ensName || address // Fallback to address if no ENS name
  } catch (error) {
    console.error(`Error resolving ENS for ${address}:`, error.message)
    return address // Fallback to address on error
  }
}

// Load and process the graph data
d3.json("graph.json")
  .then(async (data) => {
    // Process nodes to resolve ENS names
    for (const node of data.nodes) {
      if (node.address) {
        try {
          node.name = await resolveENS(node.address)
        } catch (error) {
          console.error(`Failed to resolve ENS for ${node.address}:`, error)
          node.name = node.address // Fallback to address on error
        }
      } else {
        node.name = node.id // Fallback to ID if no address
      }
      // Assign a placeholder pfp if none provided
      node.pfp = node.pfp || `https://via.placeholder.com/50?text=${node.name[0]}`
    }

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("class", "link")

    // Create nodes with images (pfps)
    const node = g.append("g").attr("class", "nodes").selectAll("g").data(data.nodes).enter().append("g")

    // Add images for nodes (pfps)
    node
      .append("image")
      .attr("xlink:href", (d) => d.pfp)
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
      .text((d) => d.name)

    // Add click interaction to highlight edges
    node.on("click", (event, d) => {
      // Reset all links to default style
      link.attr("class", "link")

      // Highlight edges connected to the clicked node
      const connectedLinks = data.links.filter((l) => {
        const sourceId = typeof l.source === "object" ? l.source.id : l.source
        const targetId = typeof l.target === "object" ? l.target.id : l.target
        return sourceId === d.id || targetId === d.id
      })

      connectedLinks.forEach((l) => {
        const linkSelection = link.filter((ld) => {
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
    node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))

    // Update simulation with nodes and links
    simulation.nodes(data.nodes)
    simulation.force("link").links(data.links)
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
  })
  .catch((error) => {
    console.error("Error loading graph data:", error)
  })
