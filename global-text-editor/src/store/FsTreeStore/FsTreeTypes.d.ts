export type FsNode = FolderNode | FileNode

export type FsNodeRow = {
  id: number
  uuid: string
  type: "folder" | "file"
  parentId: number
  name: string
  storagePath: string | null
  mimeType: string | null
  fileType: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number
}

export type FolderNode = {
  id: number
  uuid: string
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
  uuid: string
  type: "file"
  parentId: number
  name: string
  storagePath: string
  mimeType: string | null
  fileType: string
  createdAt: number
  updatedAt: number
  sortOrder: number
}