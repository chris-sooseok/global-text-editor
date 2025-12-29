
export default function Sidebar() {

    async function handleCreateFolder() {
        const name = window.prompt('Folder name?')
        if (!name) return

        const res = await window.api.createFolder(name, 1)

        if (!res.ok) {
            window.alert(res.message)
            return
        }

        console.log('Created folder:', res.folder)
        // Later: refresh your folder list here
    }

    function handleCreateFile() {
        console.log('Create File')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-black/10">
        {/* Sidebar top bar */}
        <div className="flex h-12 items-center justify-end gap-2 border-b border-black/10 px-3">
          <button
            type="button"
            onClick={handleCreateFolder}
            className="rounded-lg border border-black/20 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Create Folder
          </button>

          <button
            type="button"
            onClick={handleCreateFile}
            className="rounded-lg border border-black/20 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Create File
          </button>
        </div>

        {/* Sidebar empty space */}
        <div className="flex-1" />
      </aside>
    </div>
  )
}
