
import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'
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
    
    // rows arrives in (parent, sort_order) order
    const fsNodeRows: FsNodeRow[] = res.rows

    const fsNodeById = new Map<number, FsNode>()

    // construct FolderNode and FileNode objects
    for (const r of fsNodeRows) {
      const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
      fsNodeById.set(node.id, node)
    }

    // construct tree
    for (const node of fsNodeById.values()) {

      // if root, insert into roots
      if (node.parentId == null) {
        tree.roots.push(node)
        continue
      }

      // if not root
      const parent = fsNodeById.get(node.parentId)

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
