
import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
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
    type: "file",
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath ?? null,
    mimeType: r.mimeType ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}


class FsTree {
  roots: FsNode[] // root nodes with child nodes
  nodes: Map<number, FsNode> // all fsNodes

  constructor() {
    this.roots = []
    this.nodes = new Map<number, FsNode>()
  }
}

export { FsTree }
