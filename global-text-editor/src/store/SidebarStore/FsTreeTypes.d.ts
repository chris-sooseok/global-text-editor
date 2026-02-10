export type FsNode = FolderNode | FileNode

export type FsNodeRow = {
  id: number
  uuid: string
  type: "folder" | "file"
  isRoot: boolean
  parentId: number
  name: string
  storagePath: string
  createdAt: number
  updatedAt: number
  sortOrder: number
}

export type FolderNode = {
  id: number
  uuid: string
  type: "folder"
  isRoot: boolean
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
  isRoot: boolean
  parentId: number
  name: string
  storagePath: string
  createdAt: number
  updatedAt: number
  sortOrder: number
}