import { create } from 'zustand'
import { makeFolderNode, makeFileNode } from './SidebarStoreHelper'
import type { FsNode, FsNodeRow, FileNode, FolderNode } from './FsTreeTypes'
import type { FetchFsNodeRes } from 'api/Apis'
import { parseLocalStorage } from 'shared/helperFunctions'
import { TabManagerStore } from 'store/TabManagerStore/TabManagerStore'

type SidebarStore = {
  nodeRows: FsNodeRow[]
  roots: FsNode[]
  nodes: Map<number, FsNode>
  activeFile: FileNode | null
  activeFolder: FolderNode | null
  toggledFolderIds: Set<number>
  setActiveFile: (activeFile: FileNode | null) => void
  setActiveFolder: (activeFolder: FolderNode | null, fromFile?: boolean) => void
  toggleFolderHandler: (folderId: number) => void
  loadFsNodes: (api: Window['api']) => Promise<void>
  buildFsTree: () => void
  insertFsNodeRow: (newNode: FsNodeRow) => FsNode
  renameFsNode: (node: FsNode, newName: string) => void
  removeFsNode: (nodeId: FsNode) => void
  moveFsNode: (
    node: FsNode,
    targetNode: FsNode,
    newParentId: number | null,
    dropPostion: "before" | "inside" | "after"
  ) => void
}

const SELECTED_FILE = String(import.meta.env.VITE_SELECTED_FILE)
const SELECTED_FOLDER = String(import.meta.env.VITE_SELECTED_FOLDER)
const TOGGLED_FOLDER_IDS = String(import.meta.env.VITE_TOGGLED_FOLDERS_IDS)

export const SidebarStore = create<SidebarStore>()((set, get) => {
  const nodeRows: FsNodeRow[] = []
  const roots: FsNode[] = []
  const nodes: Map<number, FsNode> = new Map()
  const activeFile = parseLocalStorage<FileNode | null>(localStorage.getItem(SELECTED_FILE), null)
  const activeFolder = parseLocalStorage<FolderNode | null>(localStorage.getItem(SELECTED_FOLDER), null)
  const toggledFolderIds = new Set(parseLocalStorage<number[]>(localStorage.getItem(TOGGLED_FOLDER_IDS), []))
  return {
    nodeRows,
    roots,
    nodes,
    activeFile,
    activeFolder,
    toggledFolderIds,

    /** setActiveFile
     * This is the only place where openFileInActiveTab is called, meaning whenever
     * a valid file is set to be active, it will always prompt to open the file in
     * the active tab. 
     */
    setActiveFile: (nextFile) => {
      // nullifying file
      if (!nextFile) {
        localStorage.setItem(SELECTED_FILE, JSON.stringify(null))
        set({ activeFile: null })
        return
      }

      // update active file
      localStorage.setItem(SELECTED_FILE, JSON.stringify(nextFile))
      set({ activeFile: nextFile })
      // always assign file's parent to active folder
      const parentNode = get().nodes.get(nextFile.parentId) ?? null
      get().setActiveFolder(parentNode as FolderNode, true)
      // always try to open the file in active tab
      const { openFileInActiveTab } = TabManagerStore.getState()
      openFileInActiveTab(nextFile as FileNode)
    },

    //* fromFile arg is set for active file to set its parent to active folder
    setActiveFolder: (nextFolder, fromFile = false) => {
      // nullifying folder
      if (!nextFolder) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(null))
        set({ activeFolder: null })
        return
      }

      // setting active folder to active's file's parent
      if (fromFile) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(nextFolder))
        set({ activeFolder: nextFolder })
        return
      }

      const { activeFile, activeFolder, toggledFolderIds } = get()
      const isActiveFileFolder = activeFile?.parentId === activeFolder?.id
      const isActiveFolder = nextFolder?.id === activeFolder?.id
      const isExpanded = toggledFolderIds.has(nextFolder?.id ?? -1)

      // always nullify active file
      get().setActiveFile(null)

      // if folder is not active & not open -> activate and open
      if (!isActiveFolder && !isExpanded) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(nextFolder))
        set({ activeFolder: nextFolder })
        get().toggleFolderHandler(nextFolder.id)
        return
      }
      // if folder is not active & open -> activate
      if (!isActiveFolder && isExpanded) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(nextFolder))
        set({ activeFolder: nextFolder })
        return
      }
      // if folder is active & active file's folder, & open -> activate
      if (isActiveFolder && isActiveFileFolder && isExpanded) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(nextFolder))
        set({ activeFolder: nextFolder })
        return
      }
      // if folder is active & not active file's folder, & open -> unactivate and close
      if (isActiveFolder && isExpanded) {
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(null))
        set({ activeFolder: null })
        get().toggleFolderHandler(nextFolder.id)
        return
      }
    },

    toggleFolderHandler(folderId) {
      set((state) => {
        const next = new Set(state.toggledFolderIds)
        if (next.has(folderId)) next.delete(folderId)
        else next.add(folderId)
        localStorage.setItem(TOGGLED_FOLDER_IDS, JSON.stringify(Array.from(next)))
        return { toggledFolderIds: next }
      })
    },
  
    loadFsNodes: async (api) => {
      try {
        const res: FetchFsNodeRes = await api.fetchFsNodes()
        if (!res.ok) throw new Error(res.message)

        set({ nodeRows: res.rows })
      } catch (err) {
        console.error(err)
        set({ nodeRows: [] })
      }
    },

    buildFsTree: () => {
      const { nodeRows } = get()
      const roots: FsNode[] = []
      const nodes = new Map<number, FsNode>()

      // append all nodeRows to nodes
      for (const r of nodeRows) {
        const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
        nodes.set(node.id, node)
      }

      for (const node of nodes.values()) {
        // root nodes
        if (node.parentId === 0) {
          roots.push(node)
          continue
        }

        // if not root, get parent node, and append it to the parent's children
        const parent = nodes.get(node.parentId)
        if (parent && parent.type === 'folder') {
          parent.children.push(node)
          continue
        }
      }

      set({ roots, nodes})
    },

    insertFsNodeRow: (node: FsNodeRow) => {
      // insert new node into nodeRows
      set((state) => ({ nodeRows: [...state.nodeRows, node] }))
      // set new node active
      const newFsNode =  node.type === 'folder' ? makeFolderNode(node) : makeFileNode(node)
      if (newFsNode.type === 'file'){
        get().setActiveFile(newFsNode as FileNode)
      } else {
        get().setActiveFolder(newFsNode as FolderNode)
      }
      // return to set focus on new node
      return newFsNode
    },

    renameFsNode: async (node: FsNode, newName: string) => {
      if (newName.trim() === '') return
      if (node.name === newName) return

      const res = await window.api.renameFsNode(node.id, newName)

      if (!res.ok) return

      // rename files in tabs
      const { tabIdsByFileIds, renameFileInTab } = TabManagerStore.getState()
      if (node.type === 'file') {
        for (const tabId of tabIdsByFileIds[node.id] ?? []) {
          renameFileInTab(tabId, node.id, newName)
        }
      }

      // update nodeRows
      set((state) => ({
        nodeRows: state.nodeRows.map((r) =>
          r.id === node.id
            ? {
                ...r,
                name: newName
              }
            : r
        ),
      }))
    },

    removeFsNode: async (removeNode: FsNode) => {
      const res = await window.api.removeFsNode(removeNode)
      if (!res.ok) return

      // file deletion
      if (removeNode.type === 'file') {
        get().setActiveFile(null)
        // remove file from tabs
        const { tabIdsByFileIds, closeFileInTab } = TabManagerStore.getState()
        for (const tabId of tabIdsByFileIds[removeNode.id] ?? []) {
          closeFileInTab(tabId, removeNode as FileNode)
        }
      } 
      // folder deletion
      else {
        // prevent folder deletion if any child
        if (removeNode.children.length !== 0) {
          window.alert("This folder isn’t empty. Delete/move the contents first.")
          return
        }
        get().setActiveFolder(null)
        // remove folder from toggledFolderIds
        set((state) => {
          if (!state.toggledFolderIds.has(removeNode.id)) return state
          return { toggledFolderIds: new Set([...state.toggledFolderIds].filter((id) => id !== removeNode.id)) }
        })
      }

      // though reload here isn't necessary, later when recursive deletion is supportive
      await SidebarStore.getState().loadFsNodes(window.api)
    },

    moveFsNode: async (
      node: FsNode,
      targetNode: FsNode,
      newParentId: number | null,
      dropPostion: "before" | "inside" | "after"
    ) => {
      // case 1: when moving into folder, if already exists -> return
      if (dropPostion === 'inside' && node.parentId === newParentId) return

      // case 4: if moved into the same position -> return
      if (node.parentId === newParentId && dropPostion === "after" 
        && node.sortOrder - 1 === targetNode.sortOrder) return
      if (node.parentId === newParentId && dropPostion === "before"
        && node.sortOrder + 1 === targetNode.sortOrder) return
      
      const res = await window.api.moveFsNode(node, targetNode, newParentId, dropPostion)
      if (!res.ok) return
      
      // reload
      await SidebarStore.getState().loadFsNodes(window.api)
    }
  }
})

// Whenever nodeRows updates, build new FsTree
SidebarStore.subscribe((state, prevState) => {
  if (state.nodeRows !== prevState.nodeRows) {
    SidebarStore.getState().buildFsTree()
  }
})