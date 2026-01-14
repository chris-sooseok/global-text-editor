
# File and Folder Logics
Currently, same names for files and folders under same directory are allowd.
This is enabled since only fsNode id is the primary key that keeps the unique row in FsNode table.

Folder directories will be abstracted and handled by DB only.
However, for files, we will create physical files via OS.
Then, when creating physical files, consider creating shards using hash function to prevent folders from being chunked by too many files

# Sidebar to implement
- delete node
- update node
- move node

# FsNode naming convention
It allos any type of name
But when files are to be created under actual file system
The name will be escaped to be a safe name

# Sidebar current weakness
whenever states in Sidebaer (e.g. selectedParentId, createType) the Sidebar has to re-render and re-run FsTree rendering logics. This means, every DOM element of FsTree, computation of recursion, and function definition have to happen on every state change.

A practical way to avoid this is to memonize each fsNode row. Thus, even if the FsTree rendering has to happen on every state change, its computation can be eased by memonizing rows of fsNode, so that only few rows in effect need to re-compute their DOM element, which reduces computation required for rendering

> Notes
A couple key details so your expectation matches what actually happens:

What still happens: renderNode will still iterate and create React elements again (that’s unavoidable if the parent rerenders).

What gets avoided: the expensive part inside each row component (building its subtree / running more logic) can be skipped because React.memo returns the previous result when props are the same.

Big win case: selection changes. Usually only 2 rows change props (wasSelected, isSelected) so only those 2 NodeRows rerender; the rest stay cached.

Two important “gotchas” to keep memoization effective later:

Pass stable props: don’t pass freshly-created inline objects/functions if you can avoid it (or use useCallback), otherwise memo sees “new prop” every time and rerenders anyway.

Don’t pass the whole Set or big objects unless needed. For example, pass isExpanded={expandedFolderIds.has(id)} rather than the entire expandedFolderIds into every row.