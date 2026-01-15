
import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'
import type { FetchFsNodeRes } from '../../api/fsNodeApi'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
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

  return {
    id: r.id,
    type: "file",
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath ?? null,
    mimeType: r.mimeType ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}

function isFolderNode(node: FsNode): node is FolderNode {
  return node.type === 'folder'
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
      if (node.parentId === null) {
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
  insertFsNode(node: FsNodeRow): FsNode {

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

  removeFsNode(node: FsNode): void {

    const nodeToRemove = this.nodes.get(node.id)
    if (!nodeToRemove) return

    // root file
    if (nodeToRemove.type === 'file' && nodeToRemove.parentId === null){
      this.roots = this.roots.filter((n) => n.id !== nodeToRemove.id)
      return
    }

    // normal file
    if (nodeToRemove.type === 'file' && !nodeToRemove.parentId === null) {
      this.nodes.delete(nodeToRemove.id)
      const parent = this.nodes.get(nodeToRemove.parentId)
      if (parent){
        if (isFolderNode(parent)){
          parent.children.filter((n) => n.id !== nodeToRemove.id)
          return
        }
      }
    }

    // root folder


    // root folder
    // if (nodeToRemove.type === 'folder' && )
    // // 2) Remove the top node from either roots[] or parent.children[]
    // if (nodeToRemove.parentId === null) {
    //   // root node
    //   this.roots = this.roots.filter((r) => r.id !== nodeToRemove.id)
    // } else {
    //   // non-root: remove from parent's children
    //   const parent = this.nodes.get(nodeToRemove.parentId)
    //   if (parent && Array.isArray(parent.children)) {
    //     parent.children = parent.children.filter((c) => c.id !== nodeToRemove.id)
    //   }
    // }

    // 3) Delete this node (and its descendants) from the nodes map
    const stack: FsNode[] = [nodeToRemove]

    while (stack.length > 0) {
      const cur = stack.pop()
      if (!cur) continue

      // If this is a folder, push its children to delete them too
      if (cur.type === 'folder' && Array.isArray(cur.children)) {
        for (const child of cur.children) {
          stack.push(child)
        }
      }

      // Remove from the global id->node map
      this.nodes.delete(cur.id)
    }
  }

  

}

export { FsTree }
