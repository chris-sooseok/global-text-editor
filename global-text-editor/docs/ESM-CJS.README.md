# ES Module (ECMASript) and CommonJS

There are two different module systems in JS - basically, two ways to split code into files and import/export modules

## ESM
ESM is the modern standard built into JS
-   works natively in browsers
-   Vite/React/modern bundlers use this by default
-   In Node, it is enabled with
    - files with `.mjs` or
    - your `package.json` has `"type": "module"`

## CJS
This is older Node.js module system
-   historically the default in Node
-   lots of Electron main-process examples use it
-   In Node, it's the default when
    - files with `.cjs` or
    - your `package.json` doesn't have `"type": "module"`
    - even f `package.json` has `"type": "module"`, files named with `.cjs` is treated as CJS module

## Electron primarily uses CJS
A lot of Electron utilities and older snippets are written CJS. Thus, using CJS avoids "ESM import quirks"
In fact, Electron's main process is just Node.js, and Node supports both ESM and CJS.

In Vite + React setups, your renderer code is bundled (ESM-friendly).
But your Electron `main` file is often run directly by Node (no bundler)

CJS `require()` is synchronous and tends to match that style. 

