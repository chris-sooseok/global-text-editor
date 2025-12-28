# Getting Started with Electron

## The multi-process model
Electron inherits its multi-process (renderer) from Chronium, which makes the framework architecturally very similar to a modern web browser. Web browsers are incredibly complicated applications: they have to manage windows, and load third-part extensions aside from their primary task to display web content.
In order to efficiently handle browser tasks, the Chrome team decided that each tab would render in its own process. Then a single browser process control these processes, as well as the application lifecylce as a whole.

> Chromium is the big open-source browser that Google Chrome is built on.
> Chromium <-> Node.js: they both use V8, but chromium is a browser; Node is a server/desktop runtime. Then, Electron bundles Chromium + Node.js together so you can build desktop apps with web UI + access to OS features. 

## The main process
Each Electron app has a single main process, which acts as the application's entry point. The main process runs in a Node.js environment, meaning it has the ability to `require` moduels and use all of Node.js APIs.

### Managing Windows
The main process' primary purpose is to create and manage application windows with the __BrowserWindow__ module. Each instance of the __BrowserWindow__ class creates an application window that loads a web page in a separate process. You can interact with this web content from the main process using the window's `webContents` object.

``` js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ width: 800, height: 1500 })
win.loadURL('https://github.com')

const contents = win.webContents
console.log(contents) // printing github contents
```

Because a __BrowserWindow__ module is an `EventEmitter`, you can add handlers for various user events. When a BrowserWindow instance is destroyed, its corresponding renderer process gets terminiated as well.

> `EventEmitter` is Node.js' basic "events + listeners" machnism

## The renderer process
For all intents and purposes, code ran in renderer processes should behave according to web standards (insofar as Chromium does, at least) just like
- An HTML file is your entry point for the renderer process
- UI through CSS
- Executable JS code is added through `<script>` elements

## Preload scripts
Preload script allows securely exposing privileged APIs into the renderer process.

Electron's main process is a Node.js environment that has full operating system access. This process has access to Node.js built-ins, any packages installed via npm, and electron modules. On the other hand, renderer processes run only web pages and don't have direct access to Node.js by default for security reasons.

Then, preload scripts contain code that executes in a renderer process before its web content begins loading. These scripts run within the renderer context, but are granted more privileges by having access to Node.js APIs.

## IPC (Inter Process Communication)
IPC is the messaging system that lets the renderer process communicate with the main process. The renderer shouldn't directly do powerful stuff (filesystem, window control...), so it requests the main process to do it via IPC.

### Main process side
```js 
ipcMain.handle(channel, handler)
```
registers an asynchronous "RPC-style" handler for requests that expect a response 

```js
ipcMain.on(channel, listener)
``` 

registers a fire-and-forget listener (no automatic response).

### Renderer/preload side
```js
ipcRenderer.invoke(channel, ...args)
``` 
sends a request to the main process and returns a Promise for the response. 

```js
ipcRenderer.send(channel, ...args)
```
sends a message to the main process without expecting a response 

```js
ipcRenderer.on(channel, ...args)
```
listens for messages coming from the main process

### IPC mechanism
Eelectron is built on
- Chromium (renders your pages) -> `renderer process`
- Node.js + Electron -> `main process`

These are separate OS processes, so they can't just call each other's functions directly. Instead, Electron provides a message channel abstraction:
1. `Renderer/preload` serializes data you pass
2. `Electron` sends the message across a process boundary
3. `Main process` receives it on the named `channel`
4. if it's an `invoke/handle` pair
    - Main runs the handler
    - takes the return value
    - sends it back as a reply
5. Renderer's `invoke` Promise resolves with that reply

### IPC best practices
`ipcMain.handle()` lives in the main process
`ipcRenderer.invoke()` lives in preload in between the main and renderer
`DOM updates` lives in renderer 

We don't call `ipcRenderer` directly in renderder because the renderer shouldn't do `require('electron)` directly as it exposes the full Node.js access to the renderer
