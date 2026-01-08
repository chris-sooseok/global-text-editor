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
        isRoot: boolean,
        type: string,
        parentId: number | null,
        name: string
      ): Promise< CreateFsNodeRes >

      deleteFsNode(
        id: number
      ) : Promise < DeleteFsNodeRes >

      fetchFsNodes(): Promise<FetchFsNodeRes>
    }
  }
}
