import type { FsNode, FsNodeRow } from './FsTreeTypes'
import { makeFolderNode, makeFileNode } from './FsTree'

export function buildFsTree(nodeRows: FsNodeRow[]): {
  roots: FsNode[]
  nodes: Map<number, FsNode>
} {
  const nodes = new Map<number, FsNode>()
  const roots: FsNode[] = []

  for (const r of nodeRows) {
    const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
    nodes.set(node.id, node)
  }

  for (const node of nodes.values()) {
    if (node.parentId === null) {
      roots.push(node)
      continue
    }

    const parent = nodes.get(node.parentId)
    if (!parent || parent.type !== 'folder') {
      roots.push(node)
      continue
    }

    parent.children.push(node)
  }

  return { roots, nodes }
}
