import { useState } from "react"

export function useC5ApiKey(onKeyReady: (key: string) => void) {
  const [c5ApiKey, setC5ApiKey] = useState<string>("")
  const [c5KeyInput, setC5KeyInput] = useState<string>("")
  const [c5Editing, setC5Editing] = useState<boolean>(false)

  const saveC5ApiKey = async (key: string) => {
    setC5ApiKey(key)
    await chrome.storage.local.set({ c5ApiKey: key })
  }

  const initC5ApiKey = async () => {
    const stored = await chrome.storage.local.get("c5ApiKey")
    const key = (stored.c5ApiKey as string) || ""
    setC5ApiKey(key)
    setC5KeyInput(key)
    if (!key) setC5Editing(true)
    onKeyReady(key)
  }

  return {
    c5ApiKey,
    c5KeyInput,
    c5Editing,
    setC5KeyInput,
    setC5Editing,
    saveC5ApiKey,
    initC5ApiKey
  }
}
