import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext/FsTreeContext'
import type { FsNode } from '../../context/FsTreeContext/FsTreeTypes'
import { 
  submitNewNodePromptHelper, 
  cancelNewNodePromptHelper, 
  renderNewNodePromptHelper,
  renderNodeHelper,
  EMPTY_SELECTED_NODE
} from './SidebarHelper'
import type { SelectedNodeType } from './SidebarHelper'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import IconButton from './IconButton'

const SELECTED_NODE_KEY = String(import.meta.env.VITE_SELECTED_NODE_KEY)
const TOGGLED_FOLDERS_KEY = String(import.meta.env.VITE_TOGGLED_FOLDERS_KEY)

function Sidebar() {
  const FsTree = useContext(FsTreeContext)

  const [selectedNode, setSelectedNode] = useState<SelectedNodeType>(() => {
    const raw = localStorage.getItem(SELECTED_NODE_KEY)
    if (!raw) return EMPTY_SELECTED_NODE

    try {
      const parsed: SelectedNodeType = JSON.parse(raw)
      return parsed
    } catch (err) {
      console.error(err)
      return EMPTY_SELECTED_NODE
    }
  })

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

  // for newNode creation type
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  // used to render newNodePromptInput and control outside-click boundary
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  // used for new fsNode prompt input and focus control
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null) 

  // Focus newNodePromptInputRef when newNodeType has some type
  useEffect(() => {
    if (!newNodeType) return
    if (newNodePromptInputRef.current) {
       newNodePromptInputRef.current.focus()
    }
  }, [newNodeType])

  /** Global click behaviors aside from file/folder row clicks
   * - While new node prompt is activated, click anywhere outside prompt or toolbar closes the prompt */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(newNodePromptRef.current && newNodePromptRef.current.contains(target))
      const clickedIconButton = !!target.closest('[new-node-creation-btn="true"]')
      // click anywhere outside prompt => delete the prompt
      // (toolbar is allowed so you can switch folder/file without the prompt instantly disappearing)
      if (newNodeType && !clickedInPrompt && !clickedIconButton) {
        setNewNodeType(null)
        if (newNodePromptInputRef.current) {
          newNodePromptInputRef.current.value = ''
        }
      }

      // when selectedNode is a folder, clicking outside other folders, or icon buttons, should unhighlight folder
      const clickedFolder = !!target.closest('[folder-node-row]')
      if (!clickedFolder && selectedNode.type == 'folder' && !clickedIconButton && !newNodeType) {
        selectNodeHandler(EMPTY_SELECTED_NODE)
      }
    }

    // capture phase so it runs even if other handlers stopPropagation later
    window.addEventListener('mousedown', onMouseDown, true)
    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [newNodeType, selectedNode])

  /** 
   * Updates newNodeType to selected type  
   * Once the state changes, renderNewNodePrompt will re-evaludate
   * whether to display <li> element that contains 
   * newNodePromptRef and newNodePromptInputRef
   * */
  function createNewNode(type: 'folder' | 'file') {
    // if new node type is already set, skip
    if (newNodeType == type) return
    
    // set new node type and rase newNodePromptInput if any
    setNewNodeType(type)
    if (newNodePromptInputRef.current) {
        newNodePromptInputRef.current.value = ''
    }
  }

  function selectNodeHandler({parentId, type, nodeId}:SelectedNodeType ) {
    const nextSelectedNode: SelectedNodeType = { parentId, type, nodeId }
    setSelectedNode(nextSelectedNode)
    // localStorage only stores strings, so we stringify the object.
    localStorage.setItem(SELECTED_NODE_KEY, JSON.stringify(nextSelectedNode))
  }

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
   * Submits FsNode creation
   */
  async function submitNewNodePrompt() {
    await submitNewNodePromptHelper({
      newNodePromptInputRef, // new FsNode name and reset the input once submit
      newNodeType, // new FsNode type
      cancelNewNodePrompt,
      selectedNode, // new FsNode parentId and to decide isRoot
      selectNodeHandler, // used to highlight newly created node
      FsTree,
      toggleFolderHandler
    })
  }

  /**
   * Wipes out NewNodeType and PromptInput, which will remove <li> element
   * that displayed newNodePrompt
   */
  function cancelNewNodePrompt() {
    cancelNewNodePromptHelper({
      setNewNodeType, // erasing selected type
      newNodePromptInputRef // erasing prompt input
    })
  }

  /** 
   * Render newNodePromptRef and newNodePromptInputRef under
   * either root or child direcotry under <ul> element
   */
  function renderNewNodePrompt(depth: number) {
    return renderNewNodePromptHelper({
      newNodeType, // newNodeType
      selectedNode, // recognize parent under new node
      depth, // indentation
      newNodePromptRef, // rendering newNodePrompt 
      newNodePromptInputRef, // rendering newNodePromptInput
      submitNewNodePrompt, // handle prompt submission
      cancelNewNodePrompt // handle prompt cancel
    })
  }

  /**
   * Render entire FsNode including roots and their children
   */
  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHelper({
      // file/folder needed
      node, // each node being rendered
      depth, // each node depth
      selectedNode, // used to highlight the selectedNode
      selectNodeHandler, // used to set selectedNode
      // only folder needed
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
      toggleFolderHandler,
      renderNewNodePrompt, // rendering newNodePrompt under folders
    })
  }

  function renderFsTree() {
    return (<>
      {FsTree.fsTree.roots.length === 0 ? (
          <>
            {/* no items */}
            {!newNodeType ?
               <div style={{ opacity: 0.7 }}>No items</div> : null
            }
            {/* root prompt when no items */}
            {newNodeType && selectedNode?.nodeId === null ? (
              <ul style={{ margin: 0, paddingLeft: 2 }}>
                {renderNewNodePrompt(0)}
              </ul>
            ) : null}
          </>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 2 }}>
              {/* display root node */}
              {FsTree.fsTree.roots.map((root) => renderNode(root, 0))}
              {/* root prompt when items */}
              {newNodeType && selectedNode?.nodeId  === null ? renderNewNodePrompt(0) : null}
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