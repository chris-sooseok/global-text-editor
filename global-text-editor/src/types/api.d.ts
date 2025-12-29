export {}


type Folder = {
  id: number
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
}

type ListFoldersResult =
  | { ok: true; folders: Folder[] }
  | { ok: false; message: string }

type CreateFolderResult =
  | {
      ok: true
      folder: {
        id: number
        parentId: number | null
        name: string
        createdAt: number
        updatedAt: number
      }
    }
  | { ok: false; message: string }

declare global {
  interface Window {
    api: {
      createFolder(name: string, parentId?: number | null): Promise<CreateFolderResult>
      listFolders(parentId?: number | null): Promise<ListFoldersResult>
    }
  }
}