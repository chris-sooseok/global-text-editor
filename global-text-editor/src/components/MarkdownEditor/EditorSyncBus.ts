export type EditorSyncPayload = {
  fileId: number
  jsonContent: string
  markdownContent: string
  originTabId: string
}

/** EventTargeet is a built-in browser API that supports a simple pattern
 * dispatchEvent(eventObj) -> fires an event; all registered callbacks run 
 * addEventListener(name, fn) -> register a callback for named events
 * removeEventListener(name, fn) -> unregister the callback */
const bus = new EventTarget()

export function broadcastEditorContentUpdated(payload: EditorSyncPayload) {
  /** dispatchEvent does
   * 1. look up all listeners registered under 'editors:contentUpdated'
   * 2. for each listener, call it immediately `listener(eventObj)` */
  bus.dispatchEvent(new CustomEvent<EditorSyncPayload>("editors:contentUpdated", { detail: payload }))
}

/** Subscribe function for an EventTarget-based event bus */
export function onEditorContentUpdated(handler: (payload: EditorSyncPayload) => void) {
  const listener = (e: Event) => {
    handler((e as CustomEvent<EditorSyncPayload>).detail)
  }
  /** addEventListener does
   * 1. registers a listener that will be looked up by dispatchEvent
   * 2. when the listener is called by dispatchEvent, it extracts payload from e.detail and pass it to handler */
  bus.addEventListener("editors:contentUpdated", listener)
  return () => bus.removeEventListener("editors:contentUpdated", listener)
}
