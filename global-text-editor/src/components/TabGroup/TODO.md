


# Tab Behaviors

## General rules
- There is only one active tab [y]
- Each tab has its own active file, so need to keep track of each tab's active file [y]
- 4 tabs are maximum (optional)
- Each tab has option bar to close the tab [y]
- New tab create button from an existing file 
- Tab must have at least one file always


## Local Storage

- `activeTabId: string = tabId` - active tab
- `tabIds: string[] = [tabId]` - tab list
- `activeFileByTabId = {tabId: fileId}` - active file in each tab
- `filesByTabId = {tabId: [files]}` - show file list in each tab


## Info

### Tiptap editor mount
It is possible to keep only one instance of tiptap per tab pane. Then, when file content switches, you will load only the file content and reuse the editor instance to set the content.
Furthermore, it is also possible to cache the file content, which makes it even faster

### One fileContent at a time
You don't have to render every file content on layers. Only display the active file in each tab

### Concern on re-rendering tabs
What would be expensive is opening a new tab if the new tab requires another tiptap editor instance. However, existing tab re-rendering is not to be a concern of as long as provided the right id that react can recognize

## Case 1 (no tab initially)

### Scenario 1
1. select file
2. no tab exists -> create a tab
3. set the new tab to active tab and the selected file as its active file

## Case 2 (tab already exists)

### Scenario 1 (the file is already active file in active tab)
1. select file
2. already active file in active tab -> do nothing

### Scenario 2 (the file already exists in active tab)
1. select file
2. already existing file in active tab -> set the selected file as its active file

### Scenario 3 (the file doesn't exist in active tab)
1. select file
2. the file doesn't exist in active tab
3. append the file into active tab list
4. set the selected file as its active file

## Case 3 (creating new tab)
> New tab can only be created from an existing tab
1. create new tab
2. append the active file of the current active tab to the new tab
3. set new tab as active tab and set copied file as its active file


## Case 1 (closing file)
### Scenario 1 (closing non-last file)
1. close the file
2. set active tab to the tab
3. set active file to its prevous file

### Scenario 2 (closing last file on non-last tab)
1. close the file
2. remove the tab
3. set active tab to previous tab

### Scenario 3 (closing last file on last tab)
1. close the file
2. remove the tab
3. no active file, no active tab

## Case 4 (closing tab)

### Scenario 1 (closing non-last tab)
1. close tab
2. set active tab to its previous tab

### Scenario 2 (closing the last tab)
1. close tab
2. no active file, no active tab



