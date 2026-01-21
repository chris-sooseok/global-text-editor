import { useEffect, useRef } from "react"

function DropdownComponent({
  open,
  onClose,
  children,
  items,
}: {
  open: boolean
  onClose: () => void
  children?: React.ReactNode
  items?: {
    key: string | number
    label: React.ReactNode
    iconSrc?: string
    onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void
    isActive?: boolean
  }[]
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      const el = dropdownRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        onClose()
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("keydown", onKeyDown, true)

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("keydown", onKeyDown, true)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 9999,

        border: "1px solid rgba(255,255,255,0.75)",
        borderRadius: 10,
        padding: 8,

        background: "rgba(18,18,18,0.98)",

        width: "max-content",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items
          ? items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onMouseDown={item.onMouseDown}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  padding: "2px 5px",
                  borderRadius: 8,
                  background: item.isActive ? "rgba(67, 102, 158, 0.18)" : "transparent",
                }}
              >
                {item.iconSrc ? (
                  <img
                    src={item.iconSrc}
                    color="white"
                    alt=""
                    aria-hidden="true"
                    style={{ width: 8, height: 8 }}
                  />
                ) : null}
                <span>{item.label}</span>
              </button>
            ))
          : children}
      </div>
    </div>
  )
}

export default DropdownComponent
