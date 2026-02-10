
- [] editor content sync via zustand

Currently, we use event bus to ensure files are syncing for the same file across tabs.
Although this works well between active files in tabs, when the file to be updated is not an active file, and switch happens quickly, the file doesn't get to pick up changes from the editing file. Therefore, we need some subscription strategy for this.