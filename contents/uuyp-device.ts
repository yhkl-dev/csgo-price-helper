import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youpin898.com/*"],
  run_at: "document_idle"
}

const KEY_MAP: Record<string, string> = {
  WEB_PC_UUID: "deviceId",
  WEB_DEVICE_UK: "deviceUk",
  WEB_UK: "uk"
}

function extractAndStore() {
  const deviceInfo: Record<string, string> = {}

  for (const [storageKey, headerKey] of Object.entries(KEY_MAP)) {
    const value = localStorage.getItem(storageKey)
    if (value) {
      deviceInfo[headerKey] = value
    }
  }

  if (Object.keys(deviceInfo).length > 0) {
    chrome.storage.local.set({ uuypDevice: deviceInfo }).catch(() => {
      // Storage write failed — popup will fall back to empty device info
    })
  }
}

extractAndStore()
