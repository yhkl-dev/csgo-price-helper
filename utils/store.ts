export const saveToStorage = (value: string) => {
  chrome.storage.local.set({ test: value }, () => {
    console.log("Cookie value has been saved to storage.")
  })
}

export const getFromStorage = (key: string, callback: (arg0: any) => void) => {
  chrome.storage.local.get(key, (result) => {
    if (result[key]) {
      callback(result[key])
    } else {
      console.log("Cookie not found in storage.")
    }
  })
}
