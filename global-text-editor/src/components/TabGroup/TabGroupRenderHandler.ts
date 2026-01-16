import { type Dispatch, type SetStateAction } from "react"

const TAB_GROUPS_KEY = String(import.meta.env.VITE_TAB_GROUPS_KEY)

export function addTabGroupHandler(
  setTabGroups: Dispatch<SetStateAction<string[]>>
) {
  setTabGroups((prev) => {
    const next = [...prev, `tab-group-${prev.length + 1}`]
    localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(next))
    return next
  })
}