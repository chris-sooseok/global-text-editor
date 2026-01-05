
import type { FsNode, FsNodeRow as FsNodeRow, FolderNode, FileNode } from './fsNode'
import type { FetchFsNodeRes } from '../api/fsApi'

type FsApi = Window["api"]

function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    type: "folder",
    id: r.id,
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
    type: "file",
    id: r.id,
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

  constructor() {
    this.roots = []
  }

  static async buildFsTree(api: FsApi): Promise<FsTree> {
    const tree = new FsTree()

    const res: FetchFsNodeRes = await api.fetchFsNodes()
    if (!res.ok) throw new Error(res.message)
    
    const rows: FsNodeRow[] = res.rows

    const byId = new Map<number, FsNode>()

    // loop through rows, and construct FolderNode and FileNode objects
    for (const r of rows) {
      const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
      byId.set(node.id, node)
    }

    // 
    for (const node of byId.values()) {

      // if root
      if (node.parentId == null) {
        tree.roots.push(node)
        continue
      }

      const parent = byId.get(node.parentId)

      // safety 
      if (!parent || parent.type !== 'folder') {
        tree.roots.push(node)
        continue
      }
      
      parent.children.push(node)
    }

    return tree
  }
}

export { FsTree }
