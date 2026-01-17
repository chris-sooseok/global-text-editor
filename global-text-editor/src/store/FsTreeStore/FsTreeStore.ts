import { create } from 'zustand'
import { makeFolderNode, makeFileNode } from './FsTree'
import type { FsNode, FsNodeRow } from './FsTreeTypes'
import type { FetchFsNodeRes } from '../../api/fsNodeApi'

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
  insertFsNode: (node: FsNodeRow) => FsNode
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

    insertFsNode: (node: FsNodeRow) => {
      set((state) => ({ nodeRows: [...state.nodeRows, node] }))

      const newFsNode: FsNode =
        node.type === 'folder' ? makeFolderNode(node) : makeFileNode(node)

      return newFsNode
    },

    renameFsNode: (_renameNode: FsNode) => {
      // TODO
    },

    removeFsNode: (_deleteNode: FsNode) => {
      // TODO
    },
  }
})