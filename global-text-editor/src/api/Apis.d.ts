import type { FsNodeRow } from "store/SidebarStore/FsTreeTypes";
import type { EditorTheme } from "store/ThemeStore/ThemeManagerStore";
type CreateFsNodeRes =
  | { ok: true; row: FsNodeRow }
  | { ok: false; message: string }

type FetchFsNodeRes =
  | { ok: true; rows: FsNodeRow[] }
  | { ok: false; message: string }

type FetchNormalEditorRes =
    | { ok: true; jsonContent: string }
    | { ok: false; message: string }

type MoveFsNodePayload = {node: FsNode, targetNode: FsNode, newParentId: number,
  dropPosition: "before" | "inside" | "after"}

type SaveNormalEditorRes =
    | { ok: true}
    | { ok: false; message: string }

type loadFileConfigRes =
  | { ok: true; editorTheme: "black" | "white"}
  | { ok: false}

declare global {
  interface Window {
    api: {
      /* FsNode Apis */
      createFsNode(type: string, parentId: number, name: string, fileType: string | null): Promise<CreateFsNodeRes>
      renameFsNode(id: number, newName: string): Promise<{ok: true}>
      removeFsNode(removeNode: FsNode): Promise<{ok: boolean}>
      moveFsNode(
        node: FsNode,
        targetNode: FsNode,
        newParentId: number | null,
        dropPosition: "before" | "inside" | "after"
      ): Promise<{ok: boolean}>
      fetchFsNodes(): Promise<FetchFsNodeRes>

      /* Editor Apis */
      loadJsonContent(storagePath: string): Promise<FetchNormalEditorRes>
      saveJsonContent(storagePath: string, jsonContent: string): Promise<SaveNormalEditorRes>

      saveImageAsset(
        storagePath: string,
        jsonContent: ArrayBuffer,
        originalName: string
      ): Promise<{ ok: boolean; src?: string; filename?: string; message?: string }>
      
      // onFileContentUpdated(handler: (payload: { 
      //     fileId: number
      //     fileContent: string
      //     originTabId: string 
      //   }) => void): () => void

      /* Editor Config Apis */
      loadContentConfig(id: number): Promise<loadFileConfigRes>
      changeEditorTheme(id: number, theme: EditorTheme): Promise<{ok: boolean}>
    }
  }
}
