import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext'
import type { FsNode } from '../../context/FsTreeTypes'
import { 
  submitCreatePromptHelper, 
  cancelCreatePromptHelper, 
  renderCreatePromptHelper,
  renderNodeHelper
} from './SidebarHelper'
import type { SelectedNodeType } from './SidebarHelper'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import IconButton from './IconButton'

export default function Sidebar() {
  const fsTree = useContext(FsTreeContext)

  const [selectedNode, setSelectedNode] = useState<SelectedNodeType>({parentId: null, type: null, nodeId: null})
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  // allows unfolding multiple folders at once, use lazy rendering
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number | null>>(() => new Set())
  // when not null, show the prompt (folder or file)
  const [createType, setCreateType] = useState<'folder' | 'file' | null>(null)
  // used to control outside-click boundary
  const promptRef = useRef<HTMLDivElement | null>(null)
  // used for new fsNode prompt input and focus control
  const promptInputRef = useRef<HTMLInputElement | null>(null) 


  // action when file/folder creation icon is clicked
  function startCreate(type: 'folder' | 'file') {
    setCreateType(type)

    if (selectedNode.type == 'file' && selectedNode.parentId == null) {
      setSelectedNode({parentId: null, type: null, nodeId: null})
    } else if (selectedNode.type == 'file' && selectedNode.parentId != null ) {
      if (fsTree?.tree?.nodes.has(selectedNode.parentId)) {
          const parentNode: FsNode | undefined = fsTree.tree.nodes.get(selectedNode.parentId)
          if (parentNode !== undefined) {
              setSelectedNode({parentId: parentNode.parentId, type: null, nodeId: null})
        }
    } 
    }
    if (promptInputRef.current) {
        promptInputRef.current.value = ''
    }
  }

  // handle FsNode creation
  async function submitCreatePrompt() {
    await submitCreatePromptHelper({
      promptInputRef,
      createType,
      selectedNode,
      selectedParentId,
      setSelectedParentId,
      setCreateType,
    })
  }

  function cancelCreatePrompt() {
    cancelCreatePromptHelper({setCreateType, promptInputRef})
  }

  function renderCreatePrompt(depth: number) {
    return renderCreatePromptHelper({
      createType,
      selectedNode,
      depth,
      promptRef,
      promptInputRef,
      expandedFolderIds,
      setSelectedNode,
      submitCreatePrompt,
      cancelCreatePrompt
    })
  }

  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHelper({
      node,
      depth,
      createType,
      selectedNode,
      selectedParentId,
      setExpandedFolderIds,
      expandedFolderIds,
      setSelectedNode,
      renderCreatePrompt,
      renderNode
    })
  }

  // focus the prompt input when it appears
  useEffect(() => {
    if (!createType) return
    
    if (promptInputRef.current) {
       promptInputRef.current.focus()
    }
  }, [createType, setSelectedParentId])

  // click behavior:
  // - click anywhere closes the prompt (unless click is inside prompt or toolbar)
  // - click anywhere other than a folder removes folder highlight (selectedParentId)
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(promptRef.current && promptRef.current.contains(target))
      const clickedFolderRow = !!target.closest('[data-folder-row="true"]')
      const clickedToolbar = !!target.closest('[data-sidebar-toolbar="true"]')

      // click anywhere (outside prompt) => delete the prompt
      // (toolbar is allowed so you can switch folder/file without the prompt instantly disappearing)
      if (createType && !clickedInPrompt && !clickedToolbar) {
        setCreateType(null)
        if (promptInputRef.current) {
          promptInputRef.current.value = ''
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
  }, [createType])

  // render SidebarContent on DOM
  function renderSidebarContent() {
    return (<>
      {roots.length === 0 ? (
          <>
            {!createType ?
               <div style={{ opacity: 0.7 }}>No items</div> : null
            }
           
            {/* root prompt when no items */}
            {createType && selectedNode?.nodeId === null ? (
              <ul style={{ margin: 0, paddingLeft: 2 }}>
                {renderCreatePrompt(0)}
              </ul>
            ) : null}
          </>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 2 }}>
            {/* display root node */}
            {roots.map((root) => renderNode(root, 0))}

            {/* root prompt when items */}
            {createType && selectedNode?.nodeId  === null ? renderCreatePrompt(0) : null}
          </ul>
        )
    }
    </>)
  }

  const roots = fsTree?.tree?.roots ?? []

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
              onClick={() => startCreate('folder')}
            />

            <IconButton
              src={newFileIcon}
              label="Create file"
              buttonSize={28}
              iconSize={16}
              background="white"
              onClick={() => startCreate('file')}
            />
          </div>
        </div>

        {/* Roots list */}
        {renderSidebarContent()}
      </aside>
    </>
  )
}
