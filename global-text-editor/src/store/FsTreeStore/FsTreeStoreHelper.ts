import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
    uuid: r.uuid,
    type: "folder",
    isRoot: r.isRoot,
    parentId: r.parentId,
    name: r.name,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
    children: [],
  }
}

export function makeFileNode(r: FsNodeRow): FileNode {
  return {
    id: r.id,
    uuid: r.uuid,
    type: "file",
    isRoot: r.isRoot,
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}

export function buildFsTree(nodeRows: FsNodeRow[]): {
  roots: FsNode[]
  nodes: Map<number, FsNode>
} {
  const nodes = new Map<number, FsNode>()
  const roots: FsNode[] = []

  // append all nodeRows to nodes
  for (const r of nodeRows) {
    const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
    nodes.set(node.id, node)
  }

  for (const node of nodes.values()) {
    // root nodes
    if (node.parentId === 0) {
      roots.push(node)
      continue
    }

    // if not root, get parent node, and append it to the parent's children
    const parent = nodes.get(node.parentId)
    if (parent && parent.type === 'folder') {
      parent.children.push(node)
      continue
    }
  }

  return { roots, nodes }
}