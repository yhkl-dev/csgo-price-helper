import type { DataType } from "./types"

const CACHE_TTL_MS = 30_000
const CACHE_PREFIX = "priceCache_"

interface CacheEntry {
  timestamp: number
  data: DataType[]
}

export function getCacheKey(hashName: string): string {
  return `${CACHE_PREFIX}${hashName}`
}

export async function getCachedPrices(
  hashName: string
): Promise<DataType[] | null> {
  try {
    const key = getCacheKey(hashName)
    const stored = await chrome.storage.local.get(key)
    const entry = stored[key] as CacheEntry | undefined
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > CACHE_TTL_MS) {
      // Expired — clean up
      await chrome.storage.local.remove(key)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

export async function setCachedPrices(
  hashName: string,
  data: DataType[]
): Promise<void> {
  try {
    const key = getCacheKey(hashName)
    const entry: CacheEntry = {
      timestamp: Date.now(),
      data
    }
    await chrome.storage.local.set({ [key]: entry })
  } catch {
    // Storage full or unavailable — silently skip caching
  }
}
