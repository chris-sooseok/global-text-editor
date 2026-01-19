import { useState, useEffect, useRef, useMemo } from 'react'
import { FsTreeStore } from '../../store/FsTreeStore/FsTreeStore'
import { buildFsTree } from '../../store/FsTreeStore/buildFsTree'
import { TabManagerStore } from '../../store/TabManagerStore/TabManagerStore'
import type { FileNode, FolderNode, FsNode } from '../../store/FsTreeStore/FsTreeTypes'
import { 
  submitNewNodePromptHandler,  
  renderNewNodePromptHandler,
  renderNodeHandler,
} from './SidebarHandler'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import IconButton from './IconButton'
import { parseLocalStorage } from '../../utils/utils'

const SELECTED_FILE_KEY = String(import.meta.env.VITE_SELECTED_FILE_KEY)
const SELECTED_FOLDER_KEY = String(import.meta.env.VITE_SELECTED_FOLDER_KEY)
const TOGGLED_FOLDERS_KEY = String(import.meta.env.VITE_TOGGLED_FOLDERS_KEY)

export type SelectedNodeType = FsNode | null

function Sidebar() {
  const nodeRows = FsTreeStore((store) => store.nodeRows)
  const loadFsNodes = FsTreeStore((store) => store.loadFsNodes)
  const insertFsNode = FsTreeStore((store) => store.insertFsNode)
  const renameNode = FsTreeStore((s) => s.renameFsNode)
  const removeNode = FsTreeStore((s) => s.removeFsNode)
  
  const { roots, nodes } = useMemo(() => buildFsTree(nodeRows), [nodeRows])
  /** ensure loading fsTree when mounting sidebar */
  useEffect(() => {
    void loadFsNodes(window.api)
  }, [loadFsNodes])

  const openFileInActiveTab = TabManagerStore((store) => store.openFileInActiveTab)
  
  /**  Separate states for selected file and folder to control highlight behaviors */
  const [selectedFile, setSelectedFile ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>
    (localStorage.getItem(SELECTED_FILE_KEY), null)
  })
  
  const [selectedFolder, setSelectedFolder ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>
    (localStorage.getItem(SELECTED_FOLDER_KEY), null)
  })

  /** control folder toggle */
  const [toggledFolderIds, setToggledFolderIds] = useState<Set<number>>(() => {
    // localStorage only supports arr, so we make sure to conver to Set
    const arr = parseLocalStorage<number[]>
    (localStorage.getItem(TOGGLED_FOLDERS_KEY), [])
    return new Set(arr)
  })

  /** Used for new node creation
   * newNodeType should be set to some type only when prompt is to be displayed
   * Unless some node is to be created, they all should be set to null */
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null)

  /** Used to allow update node names */
  const [renameNodeId, setRenameNodeId] = useState<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  /*** General Sidebar Behaviors ***/

  /** Control folders that are folded or expanded */
  function toggleFolderHandler(nodeId: number) {
    setToggledFolderIds((prev) => {
      const next = new Set(prev) // create a new Set so React sees a new reference
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      localStorage.setItem(TOGGLED_FOLDERS_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }

  /** 
   * Based on node selected (file or folder), highlight them
   * Also this is used to unhighlight folder for global click behavior: else case */ 
  function selectNodeHandler(node: FsNode) {
    if (node?.type === 'file') {
      const nextSelectedFile: FsNode = node      
      selectFileHandler(nextSelectedFile)
      //* We make separate check conditions to prevent state update on every selection
      // when a root file is created or selected
      if (nextSelectedFile.parentId === null) { 
        if (!selectedFolder) selectFolderHandler(null) 
      }
      // when normal file is selected, update selectedFolder to its parent
      if (nextSelectedFile.parentId !== selectedFolder?.id){
        const parentId = node.parentId
        const parentNode = parentId === null ? null : (nodes.get(parentId) ?? null)
        if (parentNode && parentNode.type === 'folder') {
          selectFolderHandler(parentNode)
        } else {
          selectFolderHandler(null)
        }
      }
      return
    } 
    
    if (node?.type === 'folder') {
      const nextSelectedFolder: FsNode = node
      // when folder is selected, nullify file so that folder is highlighted
      selectFileHandler(null)
      selectFolderHandler(nextSelectedFolder)
    }

    // ensure to focus when new node is created
    setTimeout(() => {
      // find the element to set focus
      const el = document.querySelector( `[data-node-id="${node.id}"]`) as HTMLElement | null
      el?.focus()
    }, 0)

  }

  function selectFileHandler(file: FileNode | null) {
    setSelectedFile(file)
    localStorage.setItem(SELECTED_FILE_KEY, JSON.stringify(file))

    if (!file) return
    openFileInActiveTab(file)
  }

  function selectFolderHandler(folder: FolderNode | null) {
    setSelectedFolder(folder)
    localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(folder))
  }

  // TODO
  /** If there should be no active file selected (e.g. file is deleted) */
  function unhighlightFile() {
    setSelectedFile(null)
  }

  // TODO
  function renameNodeHandler(renameNode: FsNode) {
    
  }

  function cancelRenamingNode() {
    setRenameNodeId(null)
    if (renameInputRef.current) renameInputRef.current.value = ''
    
  }

  // TODO
  async function deleteNodeHandler(deleteNode: FsNode) {
    const ok = window.confirm(`Confirm to delete \n ${deleteNode.name}`)
    if (ok) {
      try {
        const res: {ok: string} = await window.api.deleteFsNode(deleteNode.id, deleteNode.type)

      } catch (err) {

      }
    }
  }

  /** ! New Prompt Behavior for creating new FsNode */
  /** 
   * Updates newNodeType to the selected type
   * Once it changes, useEffect focues newNodePromptInputRef
   * and renderNewNodePrompt will re-evaludate
   * which <li> element to display newNodePromptRef and newNodePromptInputRef
   * under the current selectedFolder */
  function createNewNode(type: 'folder' | 'file') {
    // if new node type is already set, highlight prompt again
    if (newNodeType === type) {
      if (newNodePromptInputRef.current) newNodePromptInputRef.current.focus()
      return
    }
    // set new node type and delete prompt input if any
    setNewNodeType(type)
    if (newNodePromptInputRef.current) newNodePromptInputRef.current.value = ''
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
      insertFsNode, // update FsTreeStore
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
    setNewNodeType(null)
    if (newNodePromptInputRef.current) newNodePromptInputRef.current.value = ''
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
      nodes,
      selectFolderHandler,
      // only folder
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
      toggleFolderHandler,
      renderNewNodePrompt, // rendering newNodePrompt under folders
      // delete
      deleteNodeHandler,
      // renaming
      renameNodeId,
      renameInputRef,
      setRenameNodeId,
      renameNodeHandler,
      cancelRenamingNode,
      // support opening alredy selected file
      openFileInActiveTab,
    )
  }

  /** Render FsTree */
  function renderFsTree() {
    const highlightFsTree = (selectedFolder ? false : true)

    return (<>
      {roots.length === 0 ? (
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
              {roots.map((root) => renderNode(root, 0))}
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
      <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden'}}>
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