
# Sidebar logics
Currently, same names for files and folders under same directory are allowd.
This is enabled since only fsNode id is the primary key that keeps the unique row in FsNode table.

Folder directories will be abstracted and handled by DB only.
However, for files, we will create physical files via OS.
Then, when creating physical files, consider creating shards using hash function to prevent folders from being chunked by too many files


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