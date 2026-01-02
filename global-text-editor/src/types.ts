/**
 * Tree nodes you render:
 * - folder nodes have children
 * - file nodes do not
 */
export type FolderNode = {
  type: 'folder'
  id: number
  name: string
  children: Node[]
}

export type FileNode = {
  type: 'file'
  id: number
  name: string
}

export type Node = FolderNode | FileNode

export type Folder = {
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

export type File = {
  id: number
  folderId: number | null
  name: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

type Suc<T> = { ok: true } & T
type Err = { ok: false; message: string }

// Ok<folders: Folder[]> = { ok: true, folders: Folder[]}
type ListFoldersResult = Suc<{ folders: Folder[] }> | Err
type ListFilesResult = Suc<{ files: File[] }> | Err
type CreateFolderResult = Suc<{ folder: Folder }> | Err
type CreateFileResult = Suc<{ file: File }> | Err

declare global {
  interface Window {
    api: {
      createFolder(name: string, parentId?: number | null): Promise<CreateFolderResult>
      listFolders(parentId?: number | null): Promise<ListFoldersResult>
      createFile(name: string, parentId?: number | null): Promise<CreateFileResult>
      listFiles(parentId?: number | null): Promise<ListFilesResult>
    }
  }
}