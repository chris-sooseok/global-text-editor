import type { FsNodeRow } from "store/FsTreeStore/FsTreeTypes";

type CreateFsNodeRes =
  | { ok: true; row: FsNodeRow }
  | { ok: false; message: string }

type DeleteFsNodeRes = {ok: boolean}

type RenameFsNodeRes = {ok: boolean}

type FetchFsNodeRes =
  | { ok: true; rows: FsNodeRow[] }
  | { ok: false; message: string }

type SaveNormalEditorRes =
    | { ok: true}
    | { ok: false; message: string}

declare global {
  interface Window {
    api: {
      createFsNode(
        type: string,
        parentId: number | null,
        name: string,
        mimeType: string | null,
        fileType: string | null
      ): Promise<CreateFsNodeRes>

      renameFsNode(id: number, newName: string): Promise<RenameFsNodeRes>

      deleteFsNode(id: number): Promise<DeleteFsNodeRes>

      fetchFsNodes(): Promise<FetchFsNodeRes>

      fetchNormalEditor(storagePath: string): Promise<string>
      
      saveNormalEditor(
        id: number,
        editorData: string
      ): Promise<SaveNormalEditorRes>

      exportToPDF(): Promise<>
    }
  }
}
