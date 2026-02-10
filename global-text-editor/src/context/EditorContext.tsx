import React, { createContext, useContext, useEffect, useState} from 'react'
import type { Editor } from '@tiptap/core'
import type { FileNode } from 'store/SidebarStore/FsTreeTypes'

type MarkdownEditorCtx = {
  editor: Editor
  activeFile: FileNode
  contentConfig: ContentConfig
}

type MarkdownEditorProviderProps = {
  editor: Editor
  activeFile: FileNode
  children: React.ReactNode
}
const MarkdownEditorContext = createContext<MarkdownEditorCtx | null>(null)

export type ContentConfig = {
  editorTheme: "black" | "white"
}

export function MarkdownEditorProvider({
  editor,
  activeFile,
  children
}: MarkdownEditorProviderProps) {

  const [contentConfig, setContentConfig] = useState<ContentConfig>({ editorTheme: "black"})

  useEffect(() => {
    let cancelled = false
    async function loadContentConfig() {
      const res = await window.api.loadContentConfig(activeFile.id)
      if (cancelled) return

      if (res.ok) {
          setContentConfig({ editorTheme: res.editorTheme })
      } else {
          setContentConfig({ editorTheme: "black"})
      }
    }

    void loadContentConfig()
    return () => {
      cancelled = true
    }
  }, [activeFile.id])


  return (
    <MarkdownEditorContext.Provider value={{ editor, activeFile, contentConfig}}>
      {children}
    </MarkdownEditorContext.Provider>
  )
}

export function useMarkdownEditorContext() {
  const ctx = useContext(MarkdownEditorContext)
  if (!ctx) {
    throw new Error('useMarkdownEditor must be used within a MarkdownEditorProvider')
  }
  return ctx
}
