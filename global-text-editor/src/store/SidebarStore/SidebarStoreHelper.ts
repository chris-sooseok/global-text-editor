import type { FsNode, FsNodeRow, FolderNode, FileNode } from './FsTreeTypes'

export function makeFolderNode(r: FsNodeRow): FolderNode {
  return {
    id: r.id,
    uuid: r.uuid,
    type: "folder",
    isRoot: r.isRoot,
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
    uuid: r.uuid,
    type: "file",
    fileType: r.fileType ?? 'markdown',
    isRoot: r.isRoot,
    parentId: r.parentId,
    name: r.name,
    storagePath: r.storagePath,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    sortOrder: r.sortOrder,
  }
}