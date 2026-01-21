import type { NodeRow } from "../context/FsTree";

export type CreateFsNodeRes =
  | { ok: true; node: NodeRow }
  | { ok: false; message: string }

export type FetchFsNodeRes =
  | { ok: true; rows: NodeRow[] }
  | { ok: false; message: string }

declare global {
  interface Window {
    api: {
      createFsNode(
        type: string,
        parentId: number | null,
        name: string,
        mimeType: string
      ): Promise< CreateFsNodeRes >

      deleteFsNode(
        id: number,
        type: string,
      ) : Promise < DeleteFsNodeRes >

      renameFsNode(
        id: number,
      )

      fetchFsNodes(): Promise<FetchFsNodeRes>


      exportToPDF(): Promise<>
    }
  }
}
