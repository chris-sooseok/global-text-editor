import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
    uuid: r.uuid,
    type: "folder",
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
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath ?? "",
    mimeType: r.mimeType ?? null,
    fileType: r.fileType ?? "",
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
