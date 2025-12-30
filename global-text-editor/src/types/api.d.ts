
// make this file a module, preventing types from being defined globally
export {}

export type Folder = {
  id: number
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
}

type Suc<T> = { ok: true } & T
type Err = { ok: false; message: string }

// Ok<folders: Folder[]> = { ok: true, folders: Folder[]}
export type ListFoldersResult = Suc<{ folders: Folder[] }> | Err
export type CreateFolderResult = Suc<{ folder: Folder }> | Err

declare global {
  interface Window {
    api: {
      createFolder(name: string, parentId?: number | null): Promise<CreateFolderResult>
      listFolders(parentId?: number | null): Promise<ListFoldersResult>
    }
  }
}