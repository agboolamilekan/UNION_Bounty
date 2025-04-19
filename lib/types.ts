export interface GraphNode {
  id: string
  name?: string
  ens?: string
  fname?: string
  address?: string
  img?: string
  pfp?: string
  fid?: string
}

export interface GraphLink {
  id?: string
  source: string | GraphNode
  target: string | GraphNode
  timestamp?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
