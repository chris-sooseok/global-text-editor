# ProseMirror
Tiptap is built on top of ProseMirror, and is a wrapper around ProseMirror's module to provide user-friendly editor interface.
Everything you write on Tiptap editor is pretty much handled by ProseMirror and structured as a document in JSON blocks of a tree nodes
ProseMirror supports editor state and treats every input as transactions, which enables undo/rodo kind of functionality.

## ProseMirror Architecture

> Introduction https://tiptap.dev/docs/editor/core-concepts/introduction

### Schema
Schema defines how your document is structure. It enables you to define the kind of nodes that may occur in the document, its attributes, and the way they can be nested. This schema is very strict, and ensures that file content is well structured.

### Structure 
ProseMirror works with a strict `Schema`, which defines the allowed sturucture of a document. A document is a tree of headings, paragraphs, and other elements, called `Nodes`. `Marks` can be attached to a node. `Commands` change that document programmatically.

### State
The document is stored in a state. Changes are applied as transactions to the state. The state has details about the current content, cursor position, and selection. You can look into `Events`, for example to alter transactions before they get applied.

### Content
The document is stored internally as a ProseMirror `Node`, and can be retrieved as a Tiptap JSON object calling `editor.getJSON()`. Tiptap JSON is the recommended format for storing the document and working with it.

A Tiptap JSON document is a tree of nodes. Some nodes can have children, but text nodes can only contain text. Text nodes and other inline nodes can have amrks applied to them.

### Vocabulary
`Schema` - configures the structure your content can have
`Document` - the acutla content in your editor
`State` - Everything to describe the current content and selection of your editor
`Transaction` - A change to the state
`Extension` - register new functionality
`Node` - A type of content (heading, or paragraph)
`Mark` - can be applied to nodes
`Command` - excute an action inside the editor, that somehow changes the state


# Tiptap
Tiptap is another separate library built on top of ProseMirror to provide user-friendly editor interface that you can easily load onto your project. Under the hood, Tiptap heavily relies on Events, Commands, and Extensions to provide a flexible and powerful API to build editors.

**What it means for Tiptap to be headless**

Tiptap provides you with the document data (JSON/HTML), selectio/cursor state, events, commands, and extensions, but you have to build the exact UI of the editor on your own, such as toolbar, dropdowns, and styling. Thus, you can choose the exact features of your app and control performance and user experience

## Events
It is like an event listener that you can apply to tiptap editor instance. You can register `Events` when you are creating a new instance of editor, or to an existing instance, or even into your custom Extensions.

> More about Events: https://tiptap.dev/docs/editor/api/events

## Commands
`Commands` help you add or change editor content programmatically, meaning `Extensions` that supports `Nodes`, `Marks`, and functionalities can be accessed via `Commands` to work with editor.  All available commands are accessible through an editor instance through `editor.commands`. This also support chain commands, which you have alraedy used like `editor.chain().focus().toggleBold().run()`.
`Commands` can be combined with a `Method` like `editor.can().toggleBold()` to do Dry run commands. You can also define custom commands to build your own specific behaviors

`setContent()`, `clearContent` are also some examples of `Commands`.

> More about Commands: https://tiptap.dev/docs/editor/api/commands

## Extensions
Extensions provide new capabilities to your editor's behaviors by adding `Nodes`, `Marks`, and/or `functionalities` to the editor. Whether it is adding new types of content `Nodes`, customizing the eidtor's appearance `Marks`, or extending its functionality, extensions are the building blocks of Tiptap. You can import or even build custom extensions as you need. Then, you will configure the editor with the extensions that are loaded.

> For available extensions, https://tiptap.dev/docs/editor/extensions/overview

### Differences between Nodes and Marks
Nodes and makrs are similar in some ways, but they have different use cases. Nodes are the building bloks of your document. They define the structure and hierarchy of your content. Marks, on the other hand, are used to style of annotate text. They can be applied to any part of a node, but they don't change the structure of the document


### Configure extensions
https://tiptap.dev/docs/editor/getting-started/configure

Even extensions can be configured with the `.configure()` method, such as `Heading.configure({levels: [1, 2, 3],})` to limit the heading levels of `Heading` extension


# Custom Extensions (Extension, Node, and Mark API)

> https://tiptap.dev/docs/editor/extensions/custom-extensions

You don't only depend on the provided extensions. You can also create and extend extensions. With custom extensions you can add new **content types** and new **functionalities**, on top of waht already exists or from scratch.

Whether you are creating a node, a mark, or a functionality change, everyhing in Tiptap is based on extensions.

# API
> https://tiptap.dev/docs/editor/api/editor

The editor instance is a central building block of Tiptap. It does most of the heavy lifting of creating a working `ProseMirror` editor.

## Methods
The editor instance provides a bunch of public methods. `Methods` are regular functions and can return anything. They help you to work with the editor. Don't mix up `Methods` with `Commands`. `Commands` are used to change the state of editor and only return true or false.

`can()` checks if a `Command` or a `Command` chain can be executed - without actually executing it. Can be helpful to enable/disable or show/hide buttons. 

`destory()` stops the editor instance and unbinds all events

`chain()`, `getJSON()`..



# Miscelleneous

## Persistence
https://tiptap.dev/docs/editor/core-concepts/persistence

## Styling
https://tiptap.dev/docs/editor/getting-started/style-editor

## Shortcuts and Input Rules
Most of the core extensions register their own keyboard shorcuts. Depedning on what you want to use each extension for, you may want to change those keyboard shortcuts.

Input rules allow you to automatically transform text as you type. They can be used to create shortcuts for formatting, inserting content, or triggering commands based on specific patterns in the text.
Tiptap uses input rules under the hood to provide many of its default shortcuts (like lists, blockquotes, and marks).
