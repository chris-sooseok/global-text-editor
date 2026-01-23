
import type { FsNode } from './FsTreeTypes'

class FsTree {
  roots: FsNode[] // root nodes with child nodes
  nodes: Map<number, FsNode> // all fsNodes

  constructor() {
    this.roots = []
    this.nodes = new Map<number, FsNode>()
  }
}

export { FsTree }
