import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import { DropdownOverlay } from "shared/DropdownOverlay"
import Icon from "shared/Icon"
import blackBulletIcon from "assets/NormalTypeIcons/icons8-list-black-96.png"
import whiteBulletIcon from "assets/NormalTypeIcons/icons8-list-white-96.png"
import blackNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-black-96.png"
import whiteNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-white-96.png"
import blackTaskIcon from "assets/NormalTypeIcons/icons8-task-list-black-96.png"
import whiteTaskIcon from "assets/NormalTypeIcons/icons8-task-list-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"


function ListButton() {

  const { editor } = useMarkdownEditorContext()
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})

  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isBulletList: editor.isActive('bulletList'),
      isNumberedList: editor.isActive('orderedList'),
      isTaskList: editor.isActive('taskList')
    })
  })

  const activeIcons =
    editorState.isBulletList
      ? { black: blackBulletIcon, white: whiteBulletIcon }
      : editorState.isNumberedList
        ? { black: blackNumberedIcon, white: whiteNumberedIcon }
        : { black: blackTaskIcon, white: whiteTaskIcon }

  return (
    <div style={{ 
      position: "relative", // allows dropdown position
      // align with toolbar
      display: "flex",
      alignItems: "center"
    }}>
      {/* Toolbar Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
      >
        <EditorIcon 
          blackIcon={activeIcons.black}
          whiteIcon={activeIcons.white}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        {/* BulletList */}
        <button
          data-active-key="bulletList"
          onMouseDown={() => editor.chain().focus().toggleBulletList().run()}
        >
          <EditorIcon 
            blackIcon={blackBulletIcon} 
            whiteIcon={whiteBulletIcon} 
            isActive={editorState.isBulletList}
          />
          <span>Bullet list</span>
        </button>
        {/* OrderedList */}
        <button
          data-active-key="orderedList"
          onMouseDown={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <EditorIcon 
            blackIcon={blackNumberedIcon} 
            whiteIcon={whiteNumberedIcon} 
            isActive={editorState.isNumberedList}
          />
          <span>Ordered list</span>
        </button>
        {/* TaskList */}
        <button
          data-active-key="taskList"
          onMouseDown={() => editor.chain().focus().toggleTaskList().run()}
        >
          <EditorIcon 
            blackIcon={blackTaskIcon} 
            whiteIcon={whiteTaskIcon}
            isActive={editorState.isTaskList}
          />
          <span>Task list</span>
        </button>
      </DropdownOverlay>

    </div>
  )
}

export default ListButton
