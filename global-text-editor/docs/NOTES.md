
# React
## Context re-rendering behavior
Even if a component doesn't use the context value, if that component is wrapped inside the context provider,
the component will be re-rendered unless you use memo to prevent this


# General Notes
## LocalStorage
LocalStorage only supports string, this, is compatible with serializable data.
Using data structure like Map, or Set, need to be converted into Object, or Array, respectively. Since Map only supports integer keys, this makes sense.


# Project Progress

