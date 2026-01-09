
export type FsNode = FolderNode | FileNode

export type FsNodeRow = {
  id: number
  isRoot: boolean
  type: "folder" | "file"
  parentId: number
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  storagePath?: string | null
  sizeBytes?: number | null
  mimeType?: string | null
}

export type FolderNode = {
  id: number
  isRoot: boolean
  type: "folder"
  parentId: number
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  children: FsNode[]
}

export type FileNode = {
  id: number
  isRoot: boolean
  type: "file"
  parentId: number
  name: string
  storagePath: string
  sizeBytes: number
  mimeType: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number
}
