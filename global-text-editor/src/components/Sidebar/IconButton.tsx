
import type { CSSProperties, ButtonHTMLAttributes } from 'react'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  src: string
  label: string // used for aria-label
  title?: string
  buttonSize?: number
  iconSize?: number
  background: string
  style?: CSSProperties
}

export default function IconButton({
  src,
  label,
  title = label,
  disabled = false,
  buttonSize,
  iconSize,
  background,
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      title={title}
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
        background: background,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        opacity: disabled ? 0.5 : 1,
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
