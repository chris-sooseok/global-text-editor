import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext'
import type { FsNode } from '../../context/FsTreeTypes'
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


export default function Sidebar() {
  const FsTree = useContext(FsTreeContext)

  const [selectedNode, setSelectedNode] = useState<SelectedNodeType>(EMPTY_SELECTED_NODE)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(() => new Set())
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  // used to render newNodePromptInput and control outside-click boundary
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  // used for new fsNode prompt input and focus control
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null) 

    // focus newNodePromptInputRef when newNodeType has some type
  useEffect(() => {
    if (!newNodeType) return
    
    if (newNodePromptInputRef.current) {
       newNodePromptInputRef.current.focus()
    }
  }, [newNodeType])


  /** Global click behaviors aside from file/folder row clicks
   * - While new node prompt is activated, click anywhere outside prompt or toolbar closes the prompt
   * */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(newNodePromptRef.current && newNodePromptRef.current.contains(target))
      const clickedToolbar = !!target.closest('[new-node-creation-btn="true"]')
      // click anywhere outside prompt => delete the prompt
      // (toolbar is allowed so you can switch folder/file without the prompt instantly disappearing)
      if (newNodeType && !clickedInPrompt && !clickedToolbar) {
        setNewNodeType(null)
        if (newNodePromptInputRef.current) {
          newNodePromptInputRef.current.value = ''
        }
      }
    }

    // capture phase so it runs even if other handlers stopPropagation later
    window.addEventListener('mousedown', onMouseDown, true)

    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [newNodeType])

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

  function toggleFolder(nodeId: number) {
    setExpandedFolderIds((prev) => {
        const next = new Set(prev)
        if (next.has(nodeId)) next.delete(nodeId)
        else next.add(nodeId)
        console.log(next)
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
      selectedNode, // new FsNode parentId and to decide isRoot
      setNewNodeType, // reset the type once submit
    })
  }

  /**
   * Wipes out NewNodeType and PromptInput, which will remove <li> element
   * that displayed newNodePrompt
   */
  function cancelNewNodePrompt() {
    cancelNewNodePromptHelper({
      setNewNodeType: setNewNodeType, // erasing selected type
      newNodePromptInputRef: newNodePromptInputRef // erasing prompt input
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
      setSelectedNode, // used to set selectedNode
      // only folder needed
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      expandedFolderIds, // keep track of folder node ids to expand
      toggleFolder,
      renderNewNodePrompt, // rendering newNodePrompt under folders
    })
  }

  function renderFsTree() {
    return (
      <>
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
      </>
    )
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
