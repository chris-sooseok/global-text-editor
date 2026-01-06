import type { CSSProperties } from 'react'

export type IconButtonProps = {
  src: string
  label: string // used for aria-label
  title?: string
  onClick?: () => void
  disabled?: boolean
  buttonSize?: number
  iconSize?: number
  style?: CSSProperties
}