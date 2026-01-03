
export class FileStorageTree {
  roots: any
  static buildTree(api: any): Promise<FileStorageTree>
}

export type FolderNode = {
  type: 'folder',
  id: number,
  parentId: number,
  name: string,
  sort_order: number,
  children: Node[]
}

export type FileNode = {
  type: 'file',
  id: number,
  parendId: number,
  name: string,
  storage_path: string,
  mime_type: string,
  sort_order
}

export type Node = FolderNode | FileNode