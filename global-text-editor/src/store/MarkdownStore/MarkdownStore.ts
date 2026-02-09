import { create } from 'zustand'

type MarkdownStore = {
    content: string
    markdownIsVisibleByTabIds: Record<string, boolean>
    updateContent: (newContent: string) => void
}

export const MarkdownStore = create<MarkdownStore>()((set, get) => {
    const content = ''
    const markdownIsVisibleByTabIds = false

    return {
        content,
        markdownIsVisibleByTabIds,
        updateContent: (newContent) => set({ content: newContent })
    }
})