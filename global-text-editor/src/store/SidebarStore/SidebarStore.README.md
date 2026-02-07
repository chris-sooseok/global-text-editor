
# FsTreeStore logics

## FsNode
### FsNode at root level
1. If fsNode is to be created at the root level
- its parent_id must be seed node (id=0)
- if parent_id is 0, then fsNode's isRoot is also true


## `nodeRows`
Since Zustand by convention relies on immutability to force subscribers to update source data, it is easier to rely on easily manipulative data type. Thus, instead of constructing and providing FsTree object from the store and having burden to manage it, it is easier to only manage the base data of FsNode (`nodeRows`) in the store.

This way, it comes handy to implement node manipulating methods, such as `insertFsNode`, `renameFsNode`, and `removeFsNode` as listed below. These methods overwrite the state of `nodeRows`, thus forcing `Sidebar` to reload. 

When `nodeRows` updates, `Sidebar` relies on `buildFsTree` to acquire fresh state of FsTree object.

## **`loadFsNodes`**
`loadFsNodes` is called once `Sidebar` is mounted. `Sidebar` will only call it once per mount. `loadFsNodes` loads FsNode fetches FsNodeRows data from db using `fetchFsNodes` api.

