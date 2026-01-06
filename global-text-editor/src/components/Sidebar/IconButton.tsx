
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

export default function IconButton({
  src,
  label,
  title,
  onClick,
  disabled = false,
  buttonSize = 28,
  iconSize = 16,
  style,
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: buttonSize,
        height: buttonSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 6,
        background: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <img
        src={src}
        alt="" // button already has aria-label
        aria-hidden="true"
        style={{ width: iconSize, height: iconSize, display: 'block' }}
      />
    </button>
  )
}
