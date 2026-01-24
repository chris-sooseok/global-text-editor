import type { FsNodeRow } from "store/FsTreeStore/FsTreeTypes";

type CreateFsNodeRes =
  | { ok: true; row: FsNodeRow }
  | { ok: false; message: string }

type FetchFsNodeRes =
  | { ok: true; rows: FsNodeRow[] }
  | { ok: false; message: string }

type FetchNormalEditorRes =
    | { ok: true; editorData: string }
    | { ok: false; message: string }

type SaveNormalEditorRes =
    | { ok: true}
    | { ok: false; message: string }

type loadFileConfigRes =
  | { ok: true; toolbarIsVisible: boolean; editorTheme: "black" | "white"}

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

      renameFsNode(id: number, newName: string): Promise<{ok: true}>

      removeFsNode(id: number): Promise<{ok: boolean}>

      moveFsNode(id: number, newParentId: number): 
        Promise<{ok: true, parentId: number, sortOrder: number}| {ok: false}>

      fetchFsNodes(): Promise<FetchFsNodeRes>

      fetchNormalEditor(storagePath: string): Promise<FetchNormalEditorRes>
      
      saveNormalEditor(
        id: number,
        editorData: string
      ): Promise<SaveNormalEditorRes>

      loadFileConfig(id: number): Promise<loadFileConfigRes>

      switchEditorTheme(id, theme: "black" | "white"): Promise<{ok: boolean}>

      exportToPDF(): Promise<>
    }
  }
}
