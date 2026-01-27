export type EditorContentUpdatedPayload = {
  fileId: number
  fileContent: string
  originTabId: string
}

const bus = new EventTarget()

export function broadcastEditorContentUpdated(payload: EditorContentUpdatedPayload) {
  bus.dispatchEvent(new CustomEvent<EditorContentUpdatedPayload>("editors:contentUpdated", { detail: payload }))
}

export function onEditorContentUpdated(
  handler: (payload: EditorContentUpdatedPayload) => void
) {
  const listener = (e: Event) => {
    handler((e as CustomEvent<EditorContentUpdatedPayload>).detail)
  }

  bus.addEventListener("editors:contentUpdated", listener)
  return () => bus.removeEventListener("editors:contentUpdated", listener)
}
