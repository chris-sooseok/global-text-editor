

class FolderNode {
    constructor(id, parentId, name, sort_order)
    {
        this.type = 'folder'
        this.id = id
        this.parentId = parentId
        this.name = name
        this.sort_order = sort_order
        this.children = []
    }
}

class FileNode {
    constructor(id, parentId, name, storage_path, mime_type, sort_order)
    {
        this.type = 'file'
        this.id = id
        this.parentId = parentId
        this.name = name
        this.storage_path = storage_path
        this.mime_type = mime_type
        this.sort_order = sort_order
    }
}

class FsTree {

    constructor(folders = [], files = []) {
        this.roots = []
        this.folders = folders
        this.files = files
    }
 
    static async buildTree(api) {

        const tree = new FsTree()

        const folder_res = await api.fetchFolders()
        const file_res = await api.fetchFiles()
        
        for (const f of folder_res) {
            tree.roots.push(f)
        }

        for (const f of file_res) {
            tree.roots.push(f)
        }

        return tree
    }

}


export { FsTree }