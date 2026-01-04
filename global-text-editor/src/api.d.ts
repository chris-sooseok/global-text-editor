export {}

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

declare global {
  interface Window {
    api: {
      createFolder(
        name: string,
        parentId?: number | null
      ): Promise<{ ok: boolean; message: string }>

      fetchFolders(
        parentId?: number | null
      ): Promise<
        | { ok: true; folders: Folder[] }
        | { ok: false; message: string }
      >

      createFile(
        name: string,
        parentId?: number | null
      ): Promise<{ ok: boolean; message: string }>

      fetchFiles(
        parentId?: number | null
      ): Promise<
        | { ok: true; files: File[] }
        | { ok: false; message: string }
      >
    }
  }
}
