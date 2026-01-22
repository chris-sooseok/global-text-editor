

# Editor strategy
Different file types: you avoid “schema morphing” entirely. You don’t try to jam a Markdown schema into a Normal schema editor. You just render a different editor for that type.

Many files, few visible: you don’t pay the cost of keeping ~10 heavy editor instances alive (plugins, history, DOM, event handlers). Even if saves only trigger on changes, the instances still exist and cost memory/overhead.

Saving rule stays clean: only the active editor can change, so only it schedules debounced saves. On file switch you can also “flush” the pending save once and move on.

The one real downside (and it’s the only thing that might change the decision):

When you reuse one editor instance for multiple files of the same type, undo/redo history won’t naturally be per-file anymore (because history lives inside the editor instance). You can accept that for now (many apps do), or later store/restore per-file editor state (more advanced).


### TODO


think about what attributes you need to store editor state
- note configuration
    - theme color
    - toolbar-visible
- note data
    - images