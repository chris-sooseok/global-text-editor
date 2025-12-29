export {}

type CreateFolderResult =
  | {
      ok: true
      folder: {
        id: number
        parentId: number
        name: string
        createdAt: number
        updatedAt: number
      }
    }
  | { ok: false; message: string }

declare global {
  interface Window {
    api: {
      createFolder(name: string, parentId?: number): Promise<CreateFolderResult>
    }
  }
}