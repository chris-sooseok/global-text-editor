import SidebarRenderer from '../components/Sidebar/SidebarRenderer'
import TabRenderer from '../components/Tab/TabRenderer'

export default function MainPage() {

  return (
      <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden'}}>
        <SidebarRenderer />
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
          <TabRenderer />
        </div>
      </div>
  )
}
