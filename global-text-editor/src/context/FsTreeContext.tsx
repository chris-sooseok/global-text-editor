import React, { createContext, useMemo, useEffect, useState } from "react"
import { FsTree } from "./FsTree"
import type { ReactNode } from "react"

type FsTreeContextValue = {
  tree: FsTree | null
}

const FsTreeContext = createContext<FsTreeContextValue | null>(null)

type FsTreeProviderProps = {
  api: any
  children: ReactNode
}

function FsTreeProvider({ api, children }: FsTreeProviderProps) {
  const [fsTree, setFsTree] = useState<FsTree | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const t = await FsTree.buildTree(api)
        setFsTree(t)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [api])

  const value = useMemo<FsTreeContextValue>(
    () => ({
      tree: fsTree,
    }),
    [fsTree]
  )

  return <FsTreeContext.Provider value={value}>{children}</FsTreeContext.Provider>
}

export default FsTreeProvider
export { FsTreeContext }
