

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

class FileStorageTree {

    constructor(folders = [], files = []) {
        this.roots = []
        this.files = files
        this.folders = folders
    }
 
    static async buildTree(api) {
        const folders = await api.fetchFolders()
        const files = await api.fetchFiles()
        
        return new FileStorageTree(folders, files)
    }

}


export { FileStorageTree }