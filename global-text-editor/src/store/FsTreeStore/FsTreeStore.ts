import { create } from 'zustand'
import { makeFolderNode, makeFileNode } from './FsTreeStoreHelper'
import type { FsNode, FsNodeRow } from './FsTreeTypes'
import type { FetchFsNodeRes } from 'api/fsNodeApi'

/** Imuutable Rows
 * Decided to provide FsNodeRows instead of FsTree object because
 * 1. With FsTree class instance, I had to manually update the changes to FsTree mutably
 *    whenever create, update, and delete happened. This requireed having publish function
 *    to every mutable function and to enforce subscribers to update their FsTree
 * 2. With immutable rows, now I can create, update, and delete nodes immutably
 *    This makes updates easy because I don't have to handle FsTree state manually
 *    However, this requires having buildFsTree function and builds FsTree instance
 *    whenever the nodeRows it relies on changes
 */

type FsTreeStore = {
  nodeRows: FsNodeRow[]
  loadFsNodes: (api: Window['api']) => Promise<void>
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

export const FsTreeStore = create<FsTreeStore>((set) => {
  const nodeRows: FsNodeRow[] = []

  return {
    nodeRows,
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

    insertFsNodeRow: (node: FsNodeRow) => {
      set((state) => ({ nodeRows: [...state.nodeRows, node] }))

      const newFsNode: FsNode =
        node.type === 'folder' ? makeFolderNode(node) : makeFileNode(node)

      return newFsNode
    },

    renameFsNode: async (node: FsNode, newName: string) => {
      if (newName.trim() === '') return
      if (node.name === newName) return

      const res = await window.api.renameFsNode(node.id, newName)

      if (!res.ok) return

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

      // reload
      await FsTreeStore.getState().loadFsNodes(window.api)
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
      await FsTreeStore.getState().loadFsNodes(window.api)
    }
  }
})