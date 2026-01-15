import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext/FsTreeContext'
import type { FsNode } from '../../context/FsTreeContext/FsTreeTypes'
import { 
  submitNewNodePromptHandler, 
  cancelNewNodePromptHandler, 
  renderNewNodePromptHandler,
  renderNodeHandler,
  renameNodeHandler,
  deleteNodeHandler
} from './SidebarHandler'
import type { SelectedNodeType } from './SidebarHandler'
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
   * Unless some node is to be created, they all should be set to null */
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null)

  /** Used to allow update node names */
  const [renamingNodeId, setRenamingNodeId] = useState<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  /*** Global click behaviors ***/
  useEffect(() => {
    
    // While new node prompt is activated, click anywhere outside prompt or toolbar closes the prompt should cancel prompt
    function clickOnNewNodePrompt(e: MouseEvent) {
      // not applied while newNodePrompt is not activated
      if (!newNodeType) return

      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(newNodePromptRef.current && newNodePromptRef.current.contains(target))
      const clickedIconButton = !!target.closest('[new-node-creation-btn="true"]')
      if (!clickedInPrompt && !clickedIconButton) {
        e.preventDefault()
        e.stopPropagation() // disable clicking on other file/folder
        cancelNewNodePrompt()
        if (newNodePromptInputRef.current) {
          newNodePromptInputRef.current.value = ''
        }
      }
      return
    }

    // While a selectedFolder is valid, clicking outside files, folders, toolbars should set selectedFolder null
    function clickOnSelectedFolderAndRootFile(e: MouseEvent) {
      // not applied while newNodePrompt is activated
      if (newNodeType) return 

      const target = e.target as HTMLElement | null
      if (!target) return
      
      const clickedIconButton = !!target.closest('[new-node-creation-btn="true"]')
      const clickedFolder = !!target.closest('[node-row="true"]')
      // when selectedNode is a folder, clicking outside other folders, or icon buttons, should unhighlight folder
      if (selectedFolder?.type == 'folder' && !clickedFolder && !clickedIconButton) {
        e.preventDefault()
        selectNodeHandler(null)
      }
    }

    window.addEventListener('click', clickOnNewNodePrompt, true)
    window.addEventListener('click', clickOnSelectedFolderAndRootFile, true)
    return () => {
      window.removeEventListener('click', clickOnNewNodePrompt, true)
      window.removeEventListener('click', clickOnSelectedFolderAndRootFile, true)
    }
  }, [
    newNodeType,
    selectedFolder,
  ])

  // Used explicitly to prevent input field from pushing rows off
  useEffect(() => {
    if (renamingNodeId === null) return
    renameInputRef.current?.focus({ preventScroll: true })
    renameInputRef.current?.select()
  }, [renamingNodeId])

  /*** General Sidebar Behaviors ***/
  /** 
   * Based on node selected (file or folder), highlight them
   * Also this is used to unhighlight folder for global click behavior: else case */ 
  function selectNodeHandler(node: SelectedNodeType) {
    if (node?.type === 'file') {
      // if root file is selected, set true
      const nextSelectedFile: SelectedNodeType = node
      selectFileHandler(nextSelectedFile)
      
      // when a root file is created or selected
      if (nextSelectedFile.parentId === null) { 
        if (!selectedFolder) {
          selectFolderHandler(null)
        }
      }

      // when normal file is selected, update selectedFolder to its parent
      if (nextSelectedFile.parentId != selectedFolder?.id){
        const parentNode = FsTree.fsTree.nodes.get(node.parentId) ?? null
        selectFolderHandler(parentNode)
      }

    } else if (node?.type === 'folder') {
      const nextSelectedFolder: SelectedNodeType = node
      // when folder is selected, nullify file so that folder is highlighted
      selectFileHandler(null)
      selectFolderHandler(nextSelectedFolder)
    } else {
      // for clickOnSelectedFolder useEffect
      // unhighlight folder
      selectFolderHandler(null)
    }
  }

  function selectFileHandler(file: SelectedNodeType){
    setSelectedFile(file)
    localStorage.setItem(SELECTED_FILE_KEY, JSON.stringify(file))
  }

  function selectFolderHandler(folder: SelectedNodeType) {
    setSelectedFolder(folder)
    localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(folder))
  }


  /** Control folders that are folded or expanded */
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

  /** If there should be no active file selected (e.g. file is deleted) */
  function unhighlightFile() {
    setSelectedFile(null)
  }

  /** New Prompt Behavior for creating new FsNode */
  /** 
   * Updates newNodeType to the selected type
   * Once it changes, useEffect focues newNodePromptInputRef
   * and renderNewNodePrompt will re-evaludate
   * which <li> element to display newNodePromptRef and newNodePromptInputRef
   * under the current selectedFolder */
  function createNewNode(type: 'folder' | 'file') {
    // if new node type is already set, highlight prompt again
    if (newNodeType === type) {
      if (newNodePromptInputRef.current) {
        newNodePromptInputRef.current.focus()
      }
      return
    }
    
    // set new node type and delete prompt input if any
    setNewNodeType(type)
    if (newNodePromptInputRef.current) {
        newNodePromptInputRef.current.value = ''
    }
  }

  /**
   * Create a new FsNode
   * Once submitted, it updates FsTree
   * and the new node to be highlighted */
  async function submitNewNodePrompt() {
    await submitNewNodePromptHandler(
      // both file/folder
      newNodePromptInputRef,
      newNodeType, 
      selectedFolder, // identify folder under whose new node to be created
      FsTree, // update the tree
      cancelNewNodePrompt, 
      selectNodeHandler, // selected newly created node
      // only folder
      toggleFolderHandler
    )
  }

  /**
   * Cancel newNodePrompt
   * This should be used whenever new node prompt to be cancelled */
  function cancelNewNodePrompt() {
    cancelNewNodePromptHandler(
      setNewNodeType, // erasing selected type
      newNodePromptInputRef, // erasing prompt input
    )
  }

  /** 
   * Render <li> element that contains prompt refs which is to 
   * be inserted under the current selectedFolder inside <ul> element */
  function renderNewNodePrompt(depth: number) {
    return renderNewNodePromptHandler( 
      newNodeType, // prompt type
      selectedFolder, // parent where to render prompt under
      depth, // indent
      newNodePromptRef,
      newNodePromptInputRef,
      submitNewNodePrompt, // prompt submission
      cancelNewNodePrompt // prompt cancel
    )
  }

  /** Advanced Operation supports */

  function renameNodeHandler(renamingNode: FsNode) {

  }

  function cancelRenamingNode() {
    setRenamingNodeId(null)
    // optional: clear it, but not required since it’ll unmount
    if (renameInputRef.current) renameInputRef.current.value = '' 
  }

  function deleteNode(deletingNode: FsNode) {
    deleteNodeHandler(deletingNode, FsTree)
  }

  /*** FsTree and DOM display behaviors ***/

  /** Render entire node in FsTree, including roots and their children */
  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHandler(
      // both file/folder
      node, // each node being renderer
      depth, // each node depth
      selectedFile,
      selectedFolder,
      selectNodeHandler, // used to set selectedNode
      // only file
      FsTree,
      selectFolderHandler,
      // only folder
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
      toggleFolderHandler,
      renderNewNodePrompt, // rendering newNodePrompt under folders
      // delete
      deleteNode,
      // renaming
      renamingNodeId,
      renameInputRef,
      setRenamingNodeId,
      cancelRenamingNode,
    )
  }

  /** Render FsTree */
  function renderFsTree() {
    const highlightFsTree = (selectedFolder ? false : true)

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
              background: (highlightFsTree ? 'rgba(121, 125, 131, 0.09)' : 'transparent'),
              borderRadius: 5,
              overflow: 'hidden',
            }}>
              {/* display root node */}
              {FsTree.fsTree.roots.map((root) => renderNode(root, 0))}
              {/* root prompt when items */}
              {newNodeType && !selectedFolder ? renderNewNodePrompt(0) : null}
            </ul>
          )
        }
    </>)
  }

  return (
    <>
      {/* Sidebar safe */}
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