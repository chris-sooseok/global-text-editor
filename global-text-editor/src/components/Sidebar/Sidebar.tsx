import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext/FsTreeContext'
import type { FsNode } from '../../context/FsTreeContext/FsTreeTypes'
import { 
  submitNewNodePromptHandler, 
  cancelNewNodePromptHandler, 
  renderNewNodePromptHandler,
  renderNodeHandler
} from './SidebarHelper'
import type { SelectedNodeType } from './SidebarHelper'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import IconButton from './IconButton'

const SELECTED_FILE_KEY = String(import.meta.env.VITE_SELECTED_FILE_KEY)
const SELECTED_FOLDER_KEY = String(import.meta.env.VITE_SELECTED_FOLDER_KEY)
const TOGGLED_FOLDERS_KEY = String(import.meta.env.VITE_TOGGLED_FOLDERS_KEY)

function Sidebar() {
  const FsTree = useContext(FsTreeContext)

  /**  Separate states for selected file and folder to control highlight behaviors */
  const [selectedFile, setSelectedFile ] = useState<SelectedNodeType>(() => {
    const raw = localStorage.getItem(SELECTED_FILE_KEY)
    if (!raw) return null

    try {
      const parsed: SelectedNodeType = JSON.parse(raw)
      return parsed
    } catch(err) {
      console.error(err)
      return null
    }
  })
  
  const [selectedFolder, setSelectedFolder ] = useState<SelectedNodeType>(() => {
    const raw = localStorage.getItem(SELECTED_FOLDER_KEY)
    if (!raw) return null

    try {
      const parsed: SelectedNodeType = JSON.parse(raw)
      return parsed
    } catch(err) {
      console.error(err)
      return null
    }
  })

  /** control folder toggle */
  const [toggledFolderIds, setToggledFolderIds] = useState<Set<number>>(() => {
    const raw = localStorage.getItem(TOGGLED_FOLDERS_KEY)
    if (!raw) return new Set<number>()

    try {
      const parsed: Array<number> = JSON.parse(raw)
      return new Set<number>(parsed)
    } catch (err) {
      console.error(err)
      return new Set<number>()
    }
  })

  /** Used for new node creation
   * newNodeType should be set to some type only when prompt is to be displayed
   * Unless some node is to be created, they all should be set to null
   */
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null)

  /*** Global click behaviors ***/
  useEffect(() => {

    // Focus newNodePromptInputRef when newNodeType has some type
    if (newNodeType) {
      console.log(newNodeType)
      if (newNodePromptInputRef.current) {
       newNodePromptInputRef.current.focus()
      }
    }
    
    // While new node prompt is activated, click anywhere outside prompt or toolbar closes the prompt should cancel prompt
    function clickOnNewNodePrompt(e: MouseEvent) {
      // not applied while newNodePrompt is not activated
      if (!newNodeType) return

      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(newNodePromptRef.current && newNodePromptRef.current.contains(target))
      const clickedIconButton = !!target.closest('[new-node-creation-btn="true"]')
      if (!clickedInPrompt && !clickedIconButton) {
        setNewNodeType(null)
        if (newNodePromptInputRef.current) {
          newNodePromptInputRef.current.value = ''
        }
      }
    }

    // While a selectedFolder is valid, clicking outside files, folders, toolbars should set selectedFolder null
    function clickOnSelectedFolder(e: MouseEvent) {
      // not applied while newNodePrompt is activated
      if (newNodeType) return 

      const target = e.target as HTMLElement | null
      if (!target) return
      
      const clickedIconButton = !!target.closest('[new-node-creation-btn="true"]')
      const clickedFolder = !!target.closest('[folder-node-row]')
      const clickedFile = !!target.closest('[file-node-row]')
      // when selectedNode is a folder, clicking outside other folders, or icon buttons, should unhighlight folder
      if (selectedFolder?.type == 'folder' && !clickedFolder && !clickedIconButton && !clickedFile) {
        selectNodeHandler(null)
      }
    }

    function onMouseDown(e: MouseEvent) {
      clickOnNewNodePrompt(e)
      clickOnSelectedFolder(e)
    }

    window.addEventListener('mousedown', onMouseDown, true)
    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [newNodeType, selectedFolder])

  /*** General Sidebar Behaviors ***/
  /** 
   * Based on node selected (file or folder), highlight them
   * Also this is used to unhighlight folder for global click behavior
   * */ 
  function selectNodeHandler(node: SelectedNodeType) {
    if (node?.type === 'file') {
      const nextSelectedFile: SelectedNodeType = node
      // when file is selected, update selectedFolder to its parent
      setSelectedFile(nextSelectedFile)
      if (nextSelectedFile.parentId){
          const parentNode = FsTree.fsTree.nodes.get(node.parentId) ?? null
          setSelectedFolder(parentNode)
          localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(parentNode))
      }else{
          setSelectedFolder(null)
          localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(null))
      }
      localStorage.setItem(SELECTED_FILE_KEY, JSON.stringify(nextSelectedFile))
    } else if (node?.type === 'folder') {
      const nextSelectedFolder: SelectedNodeType = node
      // should null file so that this folder is highlight
      setSelectedFile(null)
      setSelectedFolder(nextSelectedFolder)
      localStorage.setItem(SELECTED_FILE_KEY, JSON.stringify(null))
      localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(nextSelectedFolder))
    } else {
      // for clickOnSelectedNode effect
      setSelectedFolder(null)
      localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(null))
    }
  }

  /**
   * Keep tracks of folder node ids on whether to expand folders or not
   */
  function toggleFolderHandler(nodeId: number) {
    setToggledFolderIds((prev) => {
      const next = new Set(prev) // create a new Set so React sees a new reference
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      // localStorage can't store Set, so store as array of numbers
      localStorage.setItem(TOGGLED_FOLDERS_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }

  /**
   * If there should be no active file selected (e.g. file is deleted)
   */
  function unhighlightFile() {
    setSelectedFile(null)
  }

  /*** New Prompt Behavior for new FsNode creation ***/
  /** 
   * Updates newNodeType to the selected type
   * Once it changes, useEffect focues newNodePromptInputRef
   * and renderNewNodePrompt will re-evaludate
   * which <li> element to display newNodePromptRef and newNodePromptInputRef
   * under the current selectedFolder
   * */
  function createNewNode(type: 'folder' | 'file') {
    // if new node type is already set, highlight prompt again
    if (newNodeType == type) {
      if (newNodePromptInputRef.current) {
        newNodePromptInputRef.current.focus()
      }
      return
    }
    
    // set new node type and rase newNodePromptInput if any
    setNewNodeType(type)
    if (newNodePromptInputRef.current) {
        newNodePromptInputRef.current.value = ''
    }
  }

  /**
   * Create a new FsNode
   * Once submitted, it updates FsTree
   * and the new node to be highlighted
   */
  async function submitNewNodePrompt() {
    await submitNewNodePromptHandler(
      newNodePromptInputRef, // new FsNode name and reset the input once submit
      newNodeType, // new FsNode type
      cancelNewNodePrompt,
      selectedFolder, // new FsNode parentId and to decide isRoot
      selectNodeHandler, // used to highlight newly created node
      FsTree,
      toggleFolderHandler
    )
  }

  /**
   * Cancel newNodePrompt
   * This should be used whenever new node prompt to be cancelled
   */
  function cancelNewNodePrompt() {
    cancelNewNodePromptHandler(
      setNewNodeType, // erasing selected type
      newNodePromptInputRef, // erasing prompt input
    )
  }

  /** 
   * Render newNodePromptRef and newNodePromptInputRef under
   * the current selectedFolder inside <ul> element
   */
  function renderNewNodePrompt(depth: number) {
    return renderNewNodePromptHandler(
      newNodeType, // newNodeType
      selectedFolder, // recognize parent under new node
      depth, // indentation
      newNodePromptRef, // rendering newNodePrompt 
      newNodePromptInputRef, // rendering newNodePromptInput
      submitNewNodePrompt, // handle prompt submission
      cancelNewNodePrompt // handle prompt cancel
    )
  }

  /*** FsTree and DOM display behaviors ***/
  /**
   * Render entire FsNode including roots and their children
   */
  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHandler(
      // file/folder needed
      node, // each node being rendered
      depth, // each node depth
      selectedFile,
      selectedFolder,
      selectNodeHandler, // used to set selectedNode
      // only folder needed
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
      toggleFolderHandler,
      renderNewNodePrompt, // rendering newNodePrompt under folders
      FsTree,
      setSelectedFolder
    )
  }

  function renderFsTree() {
    let highlightFolderBgr
    if (selectedFolder === null){
      highlightFolderBgr = true
    }

    return (<>
      {FsTree.fsTree.roots.length === 0 ? (
          <>
            {/* no items */}
            {!newNodeType ?
               <div style={{ opacity: 0.7 }}>No items</div> : null
            }
            {/* root prompt when no items */}
            {newNodeType && selectedFolder === null ? (
              <ul style={{ margin: 0, paddingLeft: 2 }}>
                {renderNewNodePrompt(0)}
              </ul>
            ) : null}
          </>
          ) : (
            <ul style={{ 
              margin: 0,
              paddingLeft: 2,
              background: (highlightFolderBgr ? 'rgba(121, 125, 131, 0.09)' : 'transparent'),
              borderRadius: 5,
              overflow: 'hidden',
            }}>
              {/* display root node */}
              {FsTree.fsTree.roots.map((root) => renderNode(root, 0))}
              {/* root prompt when items */}
              {newNodeType && selectedFolder  === null ? renderNewNodePrompt(0) : null}
            </ul>
          )
        }
    </>)
  }

  return (
    <>
      {/* Sidebar Content */}
      <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top-right icon buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          {/* left text */}
          <div style={{ fontWeight: 600, fontSize: 20 }}>
            Files
          </div>
          {/* right icons */}
          <div 
            style={{ display: 'flex', gap: 6 }}
          >
            <IconButton
              new-node-creation-btn="true"
              src={newFolderIcon}
              label="Create folder"
              buttonSize={28}
              iconSize={16}
              background="white"
              onClick={() => createNewNode('folder')}
            />
            <IconButton
              new-node-creation-btn="true"
              src={newFileIcon}
              label="Create file"
              buttonSize={28}
              iconSize={16}
              background="white"
              onClick={() => createNewNode('file')}
            />
          </div>
        </div>
        {/* Roots list */}
        {renderFsTree()}
      </aside>
    </>
  )
}

export default Sidebar