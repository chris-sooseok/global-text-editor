
import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'
import type { FetchFsNodeRes } from '../../api/fsNodeApi'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
    isRoot: r.isRoot,
    type: "folder",
    parentId: r.parentId,
    name: r.name,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
    children: [],
  }
}

export function makeFileNode(r: FsNodeRow): FileNode {
  if (r.storagePath == null) throw new Error("FileNode requires storagePath")
  if (r.sizeBytes == null) throw new Error("FileNode requires sizeBytes")

  return {
    id: r.id,
    isRoot: r.isRoot,
    type: "file",
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath,
    sizeBytes: r.sizeBytes,
    mimeType: r.mimeType ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}

class FsTree {
  roots: FsNode[] // root nodes with child nodes
  nodes: Map<number, FsNode> // all fsNodes

  constructor() {
    this.roots = []
    this.nodes = new Map<number, FsNode>()
  }

  static async buildFsTree(api: Window["api"]): Promise<FsTree> {
    const fsTree = new FsTree()
    
    const res: FetchFsNodeRes = await api.fetchFsNodes()
    if (!res.ok) throw new Error(res.message)
    
    // rows arrives in (parent, sort_order) order
    const fsNodeRows: FsNodeRow[] = res.rows

    // construct FolderNode and FileNode objects
    for (const r of fsNodeRows) {
      const node: FsNode = r.type === 'folder' ? makeFolderNode(r) : makeFileNode(r)
      fsTree.nodes.set(node.id, node)
    }

    // construct FsTree roots
    for (const node of fsTree.nodes.values()) {

      // if root, insert into roots
      if (node.isRoot) {
        fsTree.roots.push(node)
        continue
      }

      const parent = fsTree.nodes.get(node.parentId)

      // type check
      if (!parent || parent.type !== 'folder') {
        fsTree.roots.push(node)
        continue
      }
      
      parent.children.push(node)
    }

    return fsTree
  }

  // With createFsNode res data, insert newly inserted node into FsTree
  insertNewNode(node: FsNodeRow): FsNode {

    const newNode: FsNode = node.type === 'folder' ? makeFolderNode(node) : makeFileNode(node)

    // if not in nodes, insert new node
    if (this.nodes.get(newNode.id) == undefined) {
      this.nodes.set(newNode.id, newNode)
    }

    const parent = this.nodes.get(newNode.parentId)
    
    // if no parent, it is a root node
    if (!parent || parent.type !== 'folder') {
      this.roots.push(newNode)
      return newNode
    }
      
    // if there is a parent node, insert it under the parent node
    parent.children.push(newNode)
    return newNode
  }

}

export { FsTree }
