# Folders and Files
Files and Folders can't be real directory. This makes moving those difficult.

However, still will enforce no name under the same directory for convention (least important so care about this later). For now, we have set constraint `(parent_id, name)` in db.

Each folder and file will have UUID, and all file metadata will be stored in its UUID. This makes it easy to sync across devices.

Later, we will support 'export to PDF' and 'locate file' feature to provide a way to access a copy of file content, or its metadata.


# Sidebar Optimization
## SidebarRenderer
[x] `SidebarRenderer`doesn't remount `Sidebar` on `sidebarCollpased` update. Instead, it updates `opacity`

## Sidebar
[] On every state change, `renderFsTree` uses `renderNode` method to recursively render each `FsNode`. This later can be expensive since each `FsNode` element takes up the code laid in `renderNodeHandler`. Consider memonizing this, so that at least rendering each node is less expensive though it may not be possible to prevent recursion of `renderNode` on every re-render


# TODO
## Dynamic Root
Currently, there is only one static root. Need to implement actual dynamic root nodes. Once this is updated, the root notion of Sidebar will have to change as well.

## File Upload

## Moving Files and Folder Directories

## File Icons

## File and Folder highlight logics

## Dropdown on files

## File and Folder indentation
Currently file and folder indentation are not stable

## Input field width issue
Need to dynamically set width 