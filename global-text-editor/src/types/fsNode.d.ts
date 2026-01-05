
export type FsNode = FolderNode | FileNode

export type NodeRow = {
  id: number
  type: "folder" | "file"
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  storagePath?: string | null
  sizeBytes?: number | null
  mimeType?: string | null
}

export type FolderNode = {
  type: "folder"
  id: number
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  children: FsNode[]
}

export type FileNode = {
  type: "file"
  id: number
  parentId: number | null
  name: string
  storagePath: string
  sizeBytes: number
  mimeType: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number
}
