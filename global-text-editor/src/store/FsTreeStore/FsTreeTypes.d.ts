
export type FsNode = FolderNode | FileNode

export type FsNodeRow = {
  id: number
  type: "folder" | "file"
  parentId: number
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number
  storagePath?: string | null
  mimeType?: string | null
}

export type FolderNode = {
  id: number
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
  type: "file"
  parentId: number
  name: string
  storagePath: string | null
  mimeType: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number
}


