import React, { createContext, useMemo, useEffect, useState } from "react"
import { FsTree } from "./FsTree"
import type { ReactNode } from "react"

type FsTreeContextValue = {
  fsTree: FsTree
}

const EMPTY_FSTREE = new FsTree()

const FsTreeContext = createContext<FsTreeContextValue>({fsTree:EMPTY_FSTREE})

function FsTreeProvider({ api, children }: {
  api: Window['api']
  children: ReactNode
}) {
  const [fsTree, setFsTree] = useState<FsTree>(EMPTY_FSTREE)

  useEffect(() => {
    async function loadFsTree() {
      try {
        const t = await FsTree.buildFsTree(api)
        setFsTree(t)
      } catch (err) {

        console.error(err)
      }
    }

    void loadFsTree()

}, [api])

  const value = {fsTree: fsTree}

  return <FsTreeContext.Provider value={value}>{children}</FsTreeContext.Provider>
}


export default FsTreeProvider
export { FsTreeContext }
