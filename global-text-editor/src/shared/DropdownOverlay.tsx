import React, { useEffect, useRef, useState } from "react"
import type { themeColorType } from "../components/FileEditor/NormalEditor/NormalEditor"

function DropdownOverlay({
  dropdownIsOpen,
  setDropdownIsOpen,
  parentRef,
  align = "left",
  themeColor,
  activeCheck, // editor active
  scrollable = true, // scrollable parent needs fixed position
  children,
}: {
  dropdownIsOpen: boolean
  setDropdownIsOpen: () => void
  parentRef: React.RefObject<HTMLElement | null>
  align?: "left" | "right"
  themeColor: themeColorType
  activeCheck?: (key: string) => boolean
  scrollable?: boolean
  children: React.ReactNode
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  // for fixed position dropdown
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null) 

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

    function updatePos() {
      if (!scrollable) return
      const el = parentRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const top = r.bottom + 8
      const left = align === "left" ? r.left : r.right
      setPos({ top, left })
    }

    if (scrollable) {
      updatePos()
      window.addEventListener("scroll", updatePos, true)
      window.addEventListener("resize", updatePos)
    }

    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("keydown", onKeyDown, true)

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("keydown", onKeyDown, true)
    }
  }, [dropdownIsOpen, setDropdownIsOpen, parentRef, scrollable, align])

  if (!dropdownIsOpen) return null
  if (scrollable && !pos) return null

  return (<>
  {/* DropdownOverlay */}
    <div
      ref={dropdownRef}
      style={{
        // dropdown positioning
      position: scrollable ? "fixed" : "absolute",
        top: scrollable ? pos!.top : "calc(100% + 8px)",
        left: scrollable ? pos!.left : align === "left" ? 0 : "auto",
        right: scrollable ? "auto" : align === "right" ? 0 : "auto",
        transform: scrollable && align === "right" ? "translateX(-100%)" : undefined,
        zIndex: 9999,

        // dropdown styling
        border: (themeColor === "black" 
          ? "1px solid rgba(255, 255, 255, 0.98)" 
          : "1px solid rgba(0, 0, 0, 0.98)"),
        borderRadius: 6,
        background: (themeColor === "black" 
          ? "rgba(0, 0, 0, 0.98)" 
          : "rgba(255, 255, 255, 0.98)"),
        // icon and btn color
        color: (themeColor === "black" 
          ? "rgba(255, 255, 255, 0.98)" 
          : "rgba(0, 0, 0, 0.98)"),
        // width adjust buttons
        width: "max-content",
        whiteSpace: "nowrap",
      }}
    >
      {/* Buttons */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", // button columns
      }}>
        {/* Since each parent requires differnt buttons, we accept them as children */}
        {React.Children.map(children, (child) => {

          // each button is tied to some action
          const btn = child as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>
          const btnAction = btn.props.onMouseDown

          const activeKey = (btn.props as any)["data-active-key"]
          const isActive = activeCheck ? activeCheck(activeKey) : false

          return React.cloneElement(btn, {
            role: btn.props.role ?? "menuitem",
            onMouseDown: (e) => {
              e.preventDefault()
              btnAction?.(e)
              setDropdownIsOpen() // close
            },
            style: {
              display: "flex",
              alignItems: "center", // align icon and btn
              width: "100%",
              textAlign: "left",
              padding: "4px 6px", // button pading
              background: (isActive ? "rgba(89, 90, 158, 0.98)" : "transparent"),
              cursor: "pointer",
              borderBottom: "0.5px solid"
            },
          })
        })}
      </div>
    </div>
 </>)
}

export default DropdownOverlay
