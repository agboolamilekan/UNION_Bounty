export interface UserNode {
  id: string
  name?: string
  img?: string
  ens?: string
  fname?: string
  fid?: string
}

export interface VouchLink {
  id: string
  source: string
  target: string
  timestamp?: number
}

export interface GraphData {
  nodes: UserNode[]
  links: VouchLink[]
}
