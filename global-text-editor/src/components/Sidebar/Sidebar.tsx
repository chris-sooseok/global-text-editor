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
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  // allows unfolding multiple folders at once, use lazy rendering
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(() => new Set())
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  // used to render newNodePromptInput and control outside-click boundary
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  // used for new fsNode prompt input and focus control
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null) 

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

  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHelper({
      node,
      depth,
      newNodeType,
      selectedNode,
      selectedParentId,
      setExpandedFolderIds,
      expandedFolderIds,
      setSelectedNode,
      renderCreatePrompt: renderNewNodePrompt,
      renderNode
    })
  }

  // focus newNodePromptInputRef when newNodeType has some type
  useEffect(() => {
    if (!newNodeType) return
    
    if (newNodePromptInputRef.current) {
       newNodePromptInputRef.current.focus()
    }
  }, [newNodeType])

  // click behavior:
  // - click anywhere closes the prompt (unless click is inside prompt or toolbar)
  // - click anywhere other than a folder removes folder highlight (selectedParentId)
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(newNodePromptRef.current && newNodePromptRef.current.contains(target))
      const clickedFolderRow = !!target.closest('[data-folder-row="true"]')
      const clickedToolbar = !!target.closest('[data-sidebar-toolbar="true"]')

      // click anywhere (outside prompt) => delete the prompt
      // (toolbar is allowed so you can switch folder/file without the prompt instantly disappearing)
      if (newNodeType && !clickedInPrompt && !clickedToolbar) {
        setNewNodeType(null)
        if (newNodePromptInputRef.current) {
          newNodePromptInputRef.current.value = ''
        }
      }

      // click anywhere other than folder (and not inside prompt/toolbar) => remove folder highlight
      if (!clickedFolderRow && !clickedInPrompt && !clickedToolbar) {
        setSelectedNode({ nodeId: null, type: null, parentId: null})
      }
    }

    // capture phase so it runs even if other handlers stopPropagation later
    window.addEventListener('mousedown', onMouseDown, true)

    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [newNodeType])


  return (
    <>
      {/* Sidebar Content */}
      <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top-right icon buttons */}
        <div
          data-sidebar-toolbar="true"
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
          <div style={{ display: 'flex', gap: 6 }}>
            <IconButton
              src={newFolderIcon}
              label="Create folder"
              buttonSize={28}
              iconSize={16}
              background="white"
              onClick={() => createNewNode('folder')}
            />

            <IconButton
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
        {FsTree.fsTree.roots.length === 0 ? (
          <>
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
      </aside>
    </>
  )
}
