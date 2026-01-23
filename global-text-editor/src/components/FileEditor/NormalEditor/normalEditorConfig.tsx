import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FontSize, FontFamily, TextStyle } from "@tiptap/extension-text-style"
import { ListKit } from "@tiptap/extension-list"
import Highlight from "@tiptap/extension-highlight"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { Markdown } from '@tiptap/markdown'

function normalEditorConfig() {
    const editor = useEditor({
    extensions: [
      FontFamily,
      TextStyle,
      FontSize,
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListKit,
      Highlight,
      SuperScript,
      Subscript,
      TextAlign,
      Image,
      Markdown,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "normal-editor",
        spellcheck: "false"
      }
    },
    coreExtensionOptions: {
      // making a single newline instead of two. This prevents copy/paste from
      // tiptap to other text editor having two lines
      clipboardTextSerializer: {
        blockSeparator: "\n",
      },
    },
    editable: true,
    autofocus: "start",
    // checking schema derived from registered extensions
    enableContentCheck: true,
    // checking if initial content provided is not compatible with the schema =
    onContentError(props) {
      console.log(props.error)
    },
  })

  return editor

}


export default normalEditorConfig