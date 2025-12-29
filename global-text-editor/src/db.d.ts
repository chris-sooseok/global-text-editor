export type Note = { id: number; text: string; createdAt: number }

declare global {
  interface Window {
    db: {
      listNotes(): Promise<Note[]>
      addNote(text: string): Promise<Note>
    }
  }
}

export {}
