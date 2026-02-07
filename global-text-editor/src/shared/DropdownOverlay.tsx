import React from "react"
import { createPortal } from "react-dom"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore";
import styles from "./DropdownOverlay.module.css"

type DropdownOverlayProps = {
  open: boolean
  x: number
  y: number
  align?: "right" | "left"
  onClose: () => void
  children: React.ReactNode
}

export function DropdownOverlay({
  open,
  x,
  y,
  align = "right",
  onClose,
  children,
}: DropdownOverlayProps) {
  if (!open) return null

  const dropdownBackground = ThemeManagerStore((s)=>s.dropdownBackground)
  const dropdownColor= ThemeManagerStore((s)=>s.dropdownColor)

  const OFFSET = 8

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99998 }}
      onMouseDown={onClose}
    >
      <div
        className={styles.dropdownOverlayMenu}
        style={{
          position: "fixed",
          top: y,
          left: align === "right" ? x + OFFSET : x - OFFSET,
          transform: align === "left" ? "translateX(-100%)" : undefined,
          background: dropdownBackground,
          color: dropdownColor,
          zIndex: 99999,
          minWidth: 200,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6,
          padding: 6,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
         {children}
      </div>
    </div>,
    document.body
  )
}
