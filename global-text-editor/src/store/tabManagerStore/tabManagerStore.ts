import { create } from 'zustand'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'

type FileStore = {
  file: FileNode | null
  tabIsVisible: boolean
  signalOpenFile: (selectedFile: FileNode) => void
}

export const FileStore = create<FileStore>((set) => ({
  file: null,
  tabIsVisible: false,
  signalOpenFile: (selectedFile) => {
    set({ file: selectedFile, tabIsVisible: true})
  },

  receiveOpenFile: () => {

  }
}))