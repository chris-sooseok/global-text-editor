

# TabManagerStore logics

## `TabIsVisible`
Initially when no file is selected yet, any tab should not be rendered, so should any file content.
To enforce activeTabId and tabIds has some value when some file should be displayed, we will use tabIsVisible field. If tabIsVisible is false, since tab must not be rendered, no state values for activeTabId and tabIds will be set (thus they are `undefined`).