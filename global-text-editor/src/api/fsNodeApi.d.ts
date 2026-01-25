import type { FsNodeRow } from "store/FsTreeStore/FsTreeTypes";

type CreateFsNodeRes =
  | { ok: true; row: FsNodeRow }
  | { ok: false; message: string }

type FetchFsNodeRes =
  | { ok: true; rows: FsNodeRow[] }
  | { ok: false; message: string }

type FetchNormalEditorRes =
    | { ok: true; fileContent: string }
    | { ok: false; message: string }

type MoveFsNodePayload = {node: FsNode, targetNode: FsNode, newParentId: number | null,
  dropPosition: "before" | "inside" | "after"}

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

      removeFsNode(removeNode: FsNode): Promise<{ok: boolean}>

      moveFsNode(
        node: FsNode,
        targetNode: FsNode,
        newParentId: number | null,
        dropPosition: "before" | "inside" | "after"
      ): Promise<{ok: boolean}>

      fetchFsNodes(): Promise<FetchFsNodeRes>

      loadFileContent(storagePath: string): Promise<FetchNormalEditorRes>
      
      saveFileContent(storagePath: string, fileContent: string): Promise<SaveNormalEditorRes>

      loadFileConfig(id: number): Promise<loadFileConfigRes>

      changeTheme(id: number, theme: "black" | "white"): Promise<{ok: boolean}>

      changeToolbarVisible(id: number, toolbarIsVisible: boolean): Promise<{ok: boolean}>

      exportToPDF(): Promise<>
    }
  }
}
