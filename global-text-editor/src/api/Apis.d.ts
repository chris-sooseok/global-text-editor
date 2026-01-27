import type { FsNodeRow } from "store/FsTreeStore/FsTreeTypes";
import type { EditorTheme } from "store/ThemeStore/ThemeManagerStore";
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
  | { ok: true; editorTheme: "black" | "white"}
  | { ok: false}

declare global {
  interface Window {
    api: {
      // FsNodes Apis
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

      // Editors Apis
      loadFileContent(storagePath: string): Promise<FetchNormalEditorRes>
      saveFileContent(fileId: number, storagePath: string, fileContent: string, originTabId: string): Promise<SaveNormalEditorRes>
      
      // onFileContentUpdated(handler: (payload: { 
      //     fileId: number
      //     fileContent: string
      //     originTabId: string 
      //   }) => void): () => void


      // Editor Config
      loadFileConfig(id: number): Promise<loadFileConfigRes>
      changeEditorTheme(id: number, theme: EditorTheme): Promise<{ok: boolean}>

      exportToPDF(): Promise<>
    }
  }
}
