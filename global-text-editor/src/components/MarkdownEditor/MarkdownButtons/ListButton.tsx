import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import { DropdownOverlay } from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import blackBulletIcon from "assets/NormalTypeIcons/icons8-list-black-96.png"
import whiteBulletIcon from "assets/NormalTypeIcons/icons8-list-white-96.png"
import blackNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-black-96.png"
import whiteNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-white-96.png"
import blackTaskIcon from "assets/NormalTypeIcons/icons8-task-list-black-96.png"
import whiteTaskIcon from "assets/NormalTypeIcons/icons8-task-list-white-96.png"


function ListButton({
  editor,
  fileId,
}: {
  editor: Editor
  fileId: number
}) {

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
        <ToolbarIcon 
          blackIcon={activeIcons.black}
          whiteIcon={activeIcons.white}
          fileId={fileId}
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
          <ToolbarIcon 
            blackIcon={blackBulletIcon} 
            whiteIcon={whiteBulletIcon} 
            onlyBlackIcon={true}
            isActive={editorState.isBulletList}
          />
          <span>Bullet list</span>
        </button>
        {/* OrderedList */}
        <button
          data-active-key="orderedList"
          onMouseDown={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ToolbarIcon 
            blackIcon={blackNumberedIcon} 
            whiteIcon={whiteNumberedIcon} 
            onlyBlackIcon={true}
            isActive={editorState.isNumberedList}
          />
          <span>Ordered list</span>
        </button>
        {/* TaskList */}
        <button
          data-active-key="taskList"
          onMouseDown={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ToolbarIcon 
            blackIcon={blackTaskIcon} 
            whiteIcon={whiteTaskIcon}
            onlyBlackIcon={true}
            isActive={editorState.isTaskList}
          />
          <span>Task list</span>
        </button>
      </DropdownOverlay>

    </div>
  )
}

export default ListButton
