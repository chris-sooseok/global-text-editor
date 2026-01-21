import { useEffect, useRef } from "react"
import type { themeColorType } from "../components/FileEditor/NormalEditor/NormalEditor"

function DropdownOverlay({
  dropdownIsOpen,
  setDropdownIsOpen,
  parentRef,
  align = "left",
  themeColor,
  children,
}: {
  dropdownIsOpen: boolean
  setDropdownIsOpen: () => void
  parentRef: React.RefObject<HTMLElement | null>
  align?: "left" | "right"
  themeColor: themeColorType
  children: React.ReactNode
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!dropdownIsOpen) return

    function onPointerDown(e: PointerEvent) {
      const target = e.target
      if (!(target instanceof Node)) return

      if (dropdownRef.current?.contains(target)) return
      if (parentRef.current?.contains(target)) return

      setDropdownIsOpen()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownIsOpen()
    }

    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("keydown", onKeyDown, true)

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("keydown", onKeyDown, true)
    }
  }, [dropdownIsOpen, setDropdownIsOpen, parentRef])

  if (!dropdownIsOpen) return null

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        zIndex: 9999,
        left: align === "left" ? 0 : "auto",
        right: align === "right" ? 0 : "auto",
        border: "1px solid rgba(255,255,255,0.75)",
        borderRadius: 10,
        padding: 8,
        background: (themeColor === "black" ? "rgba(0, 0, 0, 0.98)" : "rgba(255, 255, 255, 0.98)"),
        color: (themeColor === "black" ? "rgba(255, 255, 255, 0.98)" : "rgba(0, 0, 0, 0.98)"),
        width: "max-content",
        whiteSpace: "nowrap",
        justifyContent: "left"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

export default DropdownOverlay
