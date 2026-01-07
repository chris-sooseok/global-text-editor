import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react"

/** Used to control selectedNode highlight, and etc */
export type SelectedNodeType =
  | { parentId: number | null; type : 'folder' | 'file'; nodeId: number 
  | null} | null

/** Used in renderCreatePrompt to handle node create submission */
export function submitCreatePromptHelper(args: {
  promptInputRef: RefObject<HTMLInputElement | null>
  createType: 'folder' | 'file' | null
  selectedParentId: number | null
  //* Dispath is a function that tkaes one argument and returns void
  setSelectedParentId: Dispatch<SetStateAction<number | null>>
  setCreateType: Dispatch<SetStateAction<'folder' | 'file' | null>> 
}): Promise<void>

/** Used in renderCreatePrompt to cancel input prompt */
export function cancelCreatePromptHelper(args: {
  setCreateType: Dispatch<SetStateAction<'folder' | 'file' | null>>
  promptInputRef: RefObject<HTMLInputElement | null>
}
): void

/** Used to render file/folder creation input prompt under any directory */
export function renderCreatePromptHelper(args: {
    createType: 'folder' | 'file' | null
    selectedParentId: number | null
    depth: number
    promptRef: RefObject<HTMLDivElement | null>
    promptInputRef: RefObject<HTMLInputElement | null>
    submitCreatePrompt: () => Promise<void>
    cancelCreatePrompt: () => void
}): ReactNode


/** Used to visualize FsTree folder/file nodes */
export function renderNodeHelper(args: {
    node: FsNode,
    depth: number
    createType: 'folder' | 'file' | null
    selectedNode: SelectedNodeType
    selectedParentId: number | null
    expandedFolderIds: Set<number>
    toggleFolderHandler: (id: number) => void
    setSelectedNode: Dispatch<SetStateAction<SelectedNodeType>>
    setSelectedParentId: Dispatch<SetStateAction<>>
    renderCreatePrompt: (depth: number) => ReactNode
    renderNode: (node: FsNode, depth?: number) => ReactNode
})