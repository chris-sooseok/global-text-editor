type FsNode = FolderNode | FileNode
type FsApi = Window["api"]

class FolderNode {
  type: "folder" = "folder"
  id: number
  parentId: number | null
  name: string
  sortOrder: number
  children: FsNode[]

  constructor(f: { id: number; parentId: number | null; name: string; sortOrder: number }) {
    this.id = f.id
    this.parentId = f.parentId
    this.name = f.name
    this.sortOrder = f.sortOrder
    this.children = []
  }
}

class FileNode {
  type: "file" = "file"
  id: number
  parentId: number | null
  name: string
  sortOrder: number

  constructor(f: { id: number; folderId: number | null; name: string; sortOrder: number }) {
    this.id = f.id
    this.parentId = f.folderId
    this.name = f.name
    this.sortOrder = f.sortOrder
  }
}

class FsTree {
  roots: FsNode[]

  constructor() {
    this.roots = []
  }

  static async buildTree(api: FsApi): Promise<FsTree> {
    const tree = new FsTree()

    const folder_res = await api.fetchFolders()
    if (!folder_res.ok) throw new Error(folder_res.message)

    const file_res = await api.fetchFiles()
    if (!file_res.ok) throw new Error(file_res.message)

    for (const f of folder_res.folders) {
      tree.roots.push(new FolderNode(f))
    }

    for (const f of file_res.files) {
      tree.roots.push(new FileNode(f))
    }

    return tree
  }
}

export { FsTree }
