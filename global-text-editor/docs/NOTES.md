# Folders and Files
Files and Folders can't be real directory. This makes moving those difficult.

However, still will enforce no name under the same directory for convention (least important so care about this later). For now, we have set constraint `(parent_id, name)` in db.

Each folder and file will have UUID, and all file metadata will be stored in its UUID. This makes it easy to sync across devices.

Later, we will support 'export to PDF' and 'locate file' feature to provide a way to access a copy of file content, or its metadata.

# Mobile or Ipad app
I will have to research a little more and decide how implement mobile version of this app. Most likely, the mobile version won't be able to support full features like Tiptap editor. However, this is fine. The mobile app can be a simple companion app.

What we need most from mobile app is the ability to draw. Thus, for mobile apps, we may render all files, but only allow pdf or canvas types to be supported. The normal type like the one that uses Tiptap may have to be only viewable.

In fact, on desktop you will never use canvas mode. Thus, canvas may can be only for ipad. Thus, we may provide types that are device-specific. But for the best, we may still provide read-only access to other files.

One way or another, for cross devices, we will find a way to sort these out.

# Synchronization
Synchronization must be easy if physical files are as abstract as possile, meaning they are completely hidden from users. Thus, there is less tie between the app and the file structures.

# / command on tiptap which shows action options

# AI
consider implementing AI view on tab that you can directly interact with

# Drawing on normal notes

Consider dynamic node that reflects drawing on one file updates on another. This way it provides dynamic preview.



# WebView mobile app

The whole app doesn't have to be a webview. Only the editor can be run in web view since rich text editor box needs to be rendered in webview because tiptap/prosemirror needs browser DOM.
The rest of it can be a normal native app, such as native navigation, native buttons, screens, etc. WebView doesn't mean you need internet access. WebView is just an embedded browser engine, so you build the editor's HTML/JS with the app, then the WebView loads it locally.

