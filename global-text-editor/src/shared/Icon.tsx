type IconProps = {
    icon: string,
    size?: number
}

export default function Icon({
  icon,
  size = 20
}: IconProps) {
  
  return (
      <img
        src={icon}
        style={{ 
          width: size,
          height: size,
          display: "block",
          cursor: 'pointer',
        }}
      />
  )
}
