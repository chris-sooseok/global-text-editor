
# General Information
## General rules
- Each tab has a button on the top-right corner to **`closeTab`**
- 4 tabs are maximum (optional)
- New tab aside from the first initial tab is only to be opened from files by split-right button via **`openNewTab`**
- Tab pane should be draggable horizontally

## Local Storage
- `tabIsVisible: boolean` - to decide mounting point of tabs
- `activeTabId: string = tabId` - active tab
- `tabIds: string[] = [tabId]` - tab list
- `activeFileByTabId = {tabId: fileId}` - active file in each tab
- `filesByTabId = {tabId: [files]}` - show file list in each tab

<br/><br/>

# TabManagerStore Logics
## TabRenderer Component
### `tabIsVisible`
`tabIsVisible` decides whether to display tabs or not based on `tabIds.length`.
Initially, when no file is selected yet, no tab should be visible, thus `tabIds.length === 0`. \
If an initial file is to be displayed by selecting a file from `Sidebar` which fires **`openFileInActiveTab`**, then all associated states `tabIds`, `activeFileIdByTabIds`, and `filesByTabIds` are to be updated, and must set  `tabIsVisible` true to start mounting tabs.

The methods where you need to consider updating `tabIsVisible` are **`openFileInActiveTab`, `closeFile`, and `closeTab`**. In those methods, `tabStateCommiter` helps updating `tabIsVisible` according to `tabIds.length` state.

### `tabIds`
`TabRenderer` renders each tab whose id is present in `tabIds`. It passes `tabId` into each `Tab` component, which helps identifiying already existing `Tab` (This is important for re-rendering). Thus, whenever `tabIds` updates (new tab added or deleted), it only mounts or un-mounts the tab that has been added or deleted; other tabs that keeps its `tabId` will simply re-renders.

The first initial `tabId` is to be added when any file is selected from `Sidebar`. Additional `tabId` can only be added by **split-right** button which you can display by right-clicking on any file that you wish to copy over into new tab from (Sidebar or Tab), and is tied to **`openNewTab`** method.

> Consider also keeping one initial `Tab` component just like the default `activeTabId` if this may help an initial performance of tab mount

## Tab Component
### `activeTabId`
The default value of `activeTabId` is `'tab-1'` even when there is no tab to be displayed. This default value prevent having to set `activeTabId` to `null` which makes it curbersome than is neccessary to write `ts` code due to having to check `null` state. \
When any files are selected, the selected files will be appended into the current active tab. Also, the current active tab will highlight its active file with brighter bottom border. 

`activeTabId` is to be updated under three scenarios.
1. when a new tab is to be created by **`openNewTab`** by **split-right**.
2. when the current active tab is to be closed by **`closeTab`** or also possibly by **`closeFile`**.
3. when some file from non-active tab is selected via **`switchActiveTab`** and checks if current active tab matches its tab

### `activeFileIdByTabIds`
This identifies the current active file of each tab. Each tab must own an active file, and must only dispaly the content of the active file.

`activeFileIdByTabIds` is to be updated
1. when non-active file in the tab is selected via **`switchActiveFile`**
2. when new file is added to the tab via **`openFileInActiveTab`**
3. when the current active file is to be closed by **`closeFile`**
4. when the tab closes via **`closeTab`**

### `filesByTabIds`
This identifies the list of files in each tab. Thus, each tab can display the options you switch in the tab. Each file element to be displayed has **`switchActiveFile`** for switching file, **`closeFile`** for closing file, and **`switchActiveTab`** for activating tab.

`filesByTabIds` is to be updated
1. whenever a new file is to be added
2. whenever a file is to be closed
3. whenever a new tab is to be added
4. whenever the tab is to be closed







