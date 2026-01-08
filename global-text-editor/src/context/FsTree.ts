
import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'
import type { FetchFsNodeRes } from '../api/fsNodeApi'

function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
    isRoot: r.isRoot,
    type: "folder",
    parentId: r.parentId,
    name: r.name,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
    children: [],
  }
}

function makeFileNode(r: FsNodeRow): FileNode {
  if (r.storagePath == null) throw new Error("FileNode requires storagePath")
  if (r.sizeBytes == null) throw new Error("FileNode requires sizeBytes")

  return {
    id: r.id,
    isRoot: r.isRoot,
    type: "file",
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath,
    sizeBytes: r.sizeBytes,
    mimeType: r.mimeType ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}

class FsTree {
  roots: FsNode[]
  nodes: Map<number, FsNode>

  constructor() {
    this.roots = []
    this.nodes = new Map<number, FsNode>()
  }

  static async buildFsTree(api: Window["api"]): Promise<FsTree> {
    const fsTree = new FsTree()
    
    const res: FetchFsNodeRes = await api.fetchFsNodes()
    if (!res.ok) throw new Error(res.message)
    
    // rows arrives in (parent, sort_order) order
    const fsNodeRows: FsNodeRow[] = res.rows

    // construct FolderNode and FileNode objects
    for (const r of fsNodeRows) {
      const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
      fsTree.nodes.set(node.id, node)
    }

    // construct tree
    for (const node of fsTree.nodes.values()) {

      // if root, insert into roots
      if (node.isRoot) {
        fsTree.roots.push(node)
        continue
      }

      // if not root
      const parent = fsTree.nodes.get(node.parentId)

      // type check
      if (!parent || parent.type !== 'folder') {
        fsTree.roots.push(node)
        continue
      }
      
      parent.children.push(node)
    }

    return fsTree
  }

  insertNewNode(node: FsNodeRow) {

    const newNode: FsNode = node.type === 'folder' ? makeFolderNode(node) : makeFileNode(node)

    if (this.nodes.get(node.id) == undefined) {
      this.nodes.set(node.id, newNode)
    }

    const parent = this.nodes.get(node.parentId)
          // type check
    if (!parent || parent.type !== 'folder') {
      this.roots.push(newNode)
      return
    }
      
    parent.children.push(newNode)
  }

  getNode(id: number): number {
    return id
  }
}

export { FsTree }
