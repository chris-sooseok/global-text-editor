import React, { createContext, useContext } from 'react'
import type { Editor } from '@tiptap/core'

export type ContentConfig = {
  editorTheme: "black" | "white"
}

type MarkdownEditorContenxtProviderProps = {
  editor: Editor
  contentConfig: ContentConfig
  children: React.ReactNode
}

type MarkdownEditorContextProps = {
  editor: Editor
  contentConfig: ContentConfig
}

const MarkdownEditorContext = createContext<MarkdownEditorContextProps | null>(null)

export function MarkdownEditorContextProvider({
  editor,
  contentConfig,
  children
}: MarkdownEditorContenxtProviderProps) {

  return (
    <MarkdownEditorContext.Provider value={{ editor, contentConfig}}>
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
