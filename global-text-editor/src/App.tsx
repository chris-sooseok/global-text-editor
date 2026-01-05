import Sidebar from './pages/Sidebar'
import FsTreeProvider from './context/FsTreeContext'


function App() {
  return (
      <>
        <FsTreeProvider api={window.api}>
          <Sidebar />
        </FsTreeProvider>
      </>
      
  )
}


export default App