export{}

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
      fetchFolders(parentId?: number | null): Promise<ListFoldersResult>
      createFile(name: string, parentId?: number | null): Promise<CreateFileResult>
      fetchFiles(parentId?: number | null): Promise<ListFilesResult>
    }
  }
}