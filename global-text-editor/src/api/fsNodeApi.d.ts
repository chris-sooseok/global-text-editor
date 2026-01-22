import type { NodeRow } from "../context/FsTree";

export type CreateFsNodeRes =
  | { ok: true; node: NodeRow }
  | { ok: false; message: string }

export type FetchFsNodeRes =
  | { ok: true; rows: NodeRow[] }
  | { ok: false; message: string }

export type SaveNormalEditorRes =
  | { ok: true}
  | { ok: false; message: string}

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

      fetchNormalEditor(
        storagePath: string
      ): Promise<string>
      
      saveNormalEditor(
        id: number,
        editorData: string
      ): Promise<SaveNormalEditorRes>

      exportToPDF(): Promise<>
    }
  }
}
