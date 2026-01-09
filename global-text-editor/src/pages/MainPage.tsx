import SidebarRenderer from '../components/Sidebar/SidebarRenderer'
import TabGroupRenderer from '../components/TabGroup/TabGroupRenderer'
import FsTreeProvider from '../context/FsTreeContext/FsTreeContext'

export default function MainPage() {
  return (
    <FsTreeProvider api={window.api}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <SidebarRenderer />

        <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
          <TabGroupRenderer />
        </div>
      </div>
    </FsTreeProvider>
  )
}
