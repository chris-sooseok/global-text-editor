import type { NodeRow } from "../context/fsNode";

type CreateFsNodeRes =
  | { ok: true; node: NodeRow[] }
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
        name: string
      ): Promise< CreateFsNodeRes >

      fetchFsNodes(): Promise<FetchFsNodeRes>
    }
  }
}
