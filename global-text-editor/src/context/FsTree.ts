
import type { NodeRow } from '../api'

type FsApi = Window["api"]

type FsNode = FolderNode | FileNode

class FolderNode {
  type: "folder" = "folder"
  id: number
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  children: FsNode[]

  constructor(r: NodeRow) {
    // r.type should be "folder" when you call this
    this.id = r.id
    this.parentId = r.parentId
    this.name = r.name
    this.createdAt = r.createdAt
    this.updatedAt = r.updatedAt
    this.sortOrder = r.sortOrder
    this.children = []
  }
}

class FileNode {
  type: "file" = "file"
  id: number
  parentId: number | null
  name: string
  storagePath: string
  sizeBytes: number
  mimeType: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number

  constructor(r: NodeRow) {
    if (r.storagePath == null) throw new Error("FileNode requires storagePath")
    if (r.sizeBytes == null) throw new Error("FileNode requires sizeBytes")
  
    this.id = r.id
    this.parentId = r.parentId
    this.name = r.name
    this.storagePath = r.storagePath
    this.sizeBytes = r.sizeBytes
    this.mimeType = r.mimeType ?? null //! null for now
    this.createdAt = r.createdAt
    this.updatedAt = r.updatedAt
    this.sortOrder = r.sortOrder
  }
}
class FsTree {
  roots: FsNode[]

  constructor() {
    this.roots = []
  }

  static async buildFsTree(api: FsApi): Promise<FsTree> {
    const tree = new FsTree()

    const res = await api.fetchFsNodes()
    


    return tree
  }
}

export { FsTree }
