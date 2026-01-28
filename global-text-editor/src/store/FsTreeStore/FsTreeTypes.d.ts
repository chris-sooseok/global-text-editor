export type FsNode = FolderNode | FileNode

export type FsNodeRow = {
  id: number
  uuid: string
  type: "folder" | "file"
  parentId: number | null
  isRoot: boolean
  name: string
  storagePath: string | null
  createdAt: number
  updatedAt: number
  sortOrder: number
}

export type FolderNode = {
  id: number
  uuid: string
  type: "folder"
  parentId: number | null
  isRoot: boolean
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
  parentId: number | null
  isRoot: boolean
  name: string
  storagePath: string
  createdAt: number
  updatedAt: number
  sortOrder: number
}