import type { NodeRow } from "../context/fsNode";

export type FetchFsNodeRes =
  | { ok: true; rows: NodeRow[] }
  | { ok: false; message: string }

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

      fetchFsNodes(): Promise<FetchFsNodeRes>
    }
  }
}
