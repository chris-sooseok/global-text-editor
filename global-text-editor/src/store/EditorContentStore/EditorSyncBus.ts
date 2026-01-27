export type EditorSyncPayload = {
  fileId: number
  jsonContent: string
  markdownContent: string
  originTabId: string
}

const bus = new EventTarget()

export function broadcastEditorContentUpdated(payload: EditorSyncPayload) {
  bus.dispatchEvent(new CustomEvent<EditorSyncPayload>("editors:contentUpdated", { detail: payload }))
}

export function onEditorContentUpdated(handler: (payload: EditorSyncPayload) => void) {
  const listener = (e: Event) => {
    handler((e as CustomEvent<EditorSyncPayload>).detail)
  }
  bus.addEventListener("editors:contentUpdated", listener)
  return () => bus.removeEventListener("editors:contentUpdated", listener)
}
