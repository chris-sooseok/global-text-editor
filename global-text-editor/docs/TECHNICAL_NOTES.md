
# React
## Context re-rendering behavior
Even if a component doesn't use the context value, if that component is wrapped inside the context provider,
the component will be re-rendered unless you use memo to prevent this


# General Notes
## LocalStorage
LocalStorage only supports string, this, is compatible with serializable data.
Using data structure like Map, or Set, need to be converted into Object, or Array, respectively. Since Map only supports integer keys, this makes sense.


# npx
Runs a command from a package.
`npx @tiptap/cli@latest add simple-editor`
This command installs `@tiptap/cli` package. Then, This package includes an executable file that can be run from the terminal. Thus, the package contains code, and also exposes a binary command. `npx` runs the CLI program and pass `add simple-editor` arguments. 