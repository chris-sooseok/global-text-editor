import { useState, useContext, useEffect, useRef } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext'
import type { FsNode } from '../../context/FsTreeTypes'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import folderIcon from '../../assets/icons8-folder-96.png'
import IconButton from './IconButton'

export default function Sidebar() {
  const fsTree = useContext(FsTreeContext)

  const [selectedParentId, setSelectedParentId]
  = useState<number | null>(null) // parentId is nullable

  const [fsNodeName, setFsNodeName] = useState<string>('')

  // allows unfolding multiple folders at once
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(() => new Set())

  // when not null, show the prompt (folder or file)
  const [createType, setCreateType] = useState<'folder' | 'file' | null>(null)

  const promptRef = useRef<HTMLDivElement | null>(null)
  const promptInputRef = useRef<HTMLInputElement | null>(null)

  function toggleFolderExpanded(folderId: number) {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  function startCreate(type: 'folder' | 'file') {
    // when create is clicked, we want root prompt -> clear folder highlight
    setSelectedParentId(null)

    setCreateType(type)
    setFsNodeName('')
  }

  function cancelCreatePrompt() {
    setCreateType(null)
    setFsNodeName('')
  }

  async function submitCreatePrompt() {
    // Enter key submits; if empty, just close the prompt
    if (fsNodeName.trim() === '') {
      cancelCreatePrompt()
      return
    }

    if (!createType) return

    // create always under root
    const parentId: number | null = null
    const res = await window.api.createFsNode(createType, parentId, fsNodeName)

    if (res.ok) {
      setSelectedParentId(null)
      setFsNodeName('')
      setCreateType(null)
    } else {
      console.error(res.message)
    }
  }

  // focus the prompt input when it appears
  useEffect(() => {
    if (!createType) return
    promptInputRef.current?.focus()
  }, [createType])

  // click behavior:
  // - click anywhere closes the prompt (unless click is inside prompt)
  // - click anywhere other than a folder removes folder highlight (selectedParentId)
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedInPrompt = !!(promptRef.current && promptRef.current.contains(target))
      const clickedFolderRow = !!target.closest('[data-folder-row="true"]')

      // click anywhere (outside prompt) => delete the prompt
      if (createType && !clickedInPrompt) {
        setCreateType(null)
        setFsNodeName('')
      }

      // click anywhere other than folder (and not inside prompt) => remove folder highlight
      if (!clickedFolderRow && !clickedInPrompt) {
        setSelectedParentId(null)
      }
    }

    // capture phase so it runs even if other handlers stopPropagation later
    window.addEventListener('mousedown', onMouseDown, true)

    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [createType])

  function renderCreatePrompt(depth: number) {
    if (!createType) return null

    return (
      <li key={`__create_prompt__:root:${createType}`}>
        <div
          ref={promptRef}
          style={{
            paddingLeft: depth * 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            ref={promptInputRef}
            placeholder={createType === 'folder' ? 'New folder name' : 'New file name'}
            value={fsNodeName}
            onChange={(e) => setFsNodeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void submitCreatePrompt()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                cancelCreatePrompt()
              }
            }}
            style={{ flex: 1 }}
          />
        </div>
      </li>
    )
  }

  function renderNode(node: FsNode, depth = 0): JSX.Element {
    const isFolder = node.type === 'folder'

    // file node
    if (!isFolder) {
      return (
        <li key={node.id}>
          <div style={{ paddingLeft: depth * 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden="true">📄</span>
              <span>{node.name}</span>
            </span>
          </div>
        </li>
      )
    }

    // folder node
    const isSelectedFolder = selectedParentId === node.id
    const isExpanded = expandedFolderIds.has(node.id)
    const children = Array.isArray(node.children) ? node.children : []

    return (
      <li key={node.id}>
        <div
          data-folder-row="true"
          style={{
            paddingLeft: depth * 14,
            cursor: 'pointer',
            fontWeight: isSelectedFolder ? 700 : 400,
            userSelect: 'none',
          }}
          onClick={() => {
            // when an unfolded folder is NOT highlighted, clicking it should ONLY re-highlight it
            // (don't fold it)
            if (isExpanded && selectedParentId !== node.id) {
              setSelectedParentId(node.id)
              return
            }

            // otherwise behave normally:
            // click folder to expand/collapse (multiple folders can be expanded)
            toggleFolderExpanded(node.id)

            // folder highlight
            setSelectedParentId((prev) => (prev === node.id ? null : node.id))
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
              {isExpanded ? '▾' : '▸'}
            </span>

            <img
              src={folderIcon}
              alt=""
              aria-hidden="true"
              style={{ width: 20, height: 20, display: 'block' }}
            />

            <span>{node.name}</span>
          </span>
        </div>

        {isExpanded && (
          <ul style={{ margin: 0, paddingLeft: 10 }}>
            {children.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  const roots = fsTree?.tree?.roots ?? []

  return (
    <>
      {/* Sidebar Content */}
      <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top-right icon buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
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

        {/* Roots list */}
        {roots.length === 0 ? (
          <>
            <div style={{ opacity: 0.7 }}>No items</div>

            {/* root prompt even when no items */}
            {createType ? (
              <ul style={{ margin: 0, paddingLeft: 10 }}>
                {renderCreatePrompt(0)}
              </ul>
            ) : null}
          </>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 10 }}>
            {roots.map((node) => renderNode(node, 0))}

            {/* root prompt goes under all root siblings */}
            {createType ? renderCreatePrompt(0) : null}
          </ul>
        )}
      </aside>
    </>
  )
}
