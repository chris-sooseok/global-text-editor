export {}

export type NodeRow = {
  id: number
  type: "folder" | "file"
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
  sortOrder: number

  // file-only fields (will be null/undefined for folders)
  storagePath?: string | null
  sizeBytes?: number | null
  mimeType?: string | null
}

declare global {
  interface Window {
    api: {
      createFolder(
        name: string,
        parentId?: number | null
      ): Promise<{ ok: boolean; message: string }>

      createFile(
        name: string,
        parentId?: number | null
      ): Promise<{ ok: boolean; message: string }>

      fetchFsNodes(): Promise<
      | { ok: true; rows: NodeRow[] }
      | { ok: false; message: string }
      >
    }
  }
}
