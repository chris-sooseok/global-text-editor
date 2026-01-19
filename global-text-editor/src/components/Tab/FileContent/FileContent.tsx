export default function FileContent() {
  return (
    <div
      style={{
        height: '100%',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: '100%',
          border: '1px dashed #999',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        }}
      >
        File content placeholder (we’ll render the selected file here later)
      </div>
    </div>
  )
}
