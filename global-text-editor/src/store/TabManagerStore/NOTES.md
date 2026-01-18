

# TabManagerStore logics

## `ActiveTabId`
if no tab is to be displayed, the ActiveTabId default value will be
'tab-1'. Then, TabIsVisible will be set based on the length of tabIds.

## `TabIsVisible`
Initially when no file is selected yet, no tab should be rendered, so should any no file content.
To enforce this, TabIsVisible will control the visiblity of tab based on the length of tabIds. If no tab exists, tabids length will be 0