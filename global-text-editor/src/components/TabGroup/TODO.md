need some research to figure out how to allow
cross component state change and re-render


consider how big packages are.
consider if things really suit my needs



Current problem is that I need to wrap FsTreeContext around Sidebar and TabGroups so that when I create, and select a file, that doesn't cause re-render of tabGroups as well. 


Sidebar own FsTree.


When the same file is selected, tabGroups won't react
