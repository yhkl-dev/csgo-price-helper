import steamData from "~SteamTradingSite-ID-Mapper/steam/730.json"

export interface SearchResult {
  en_name: string
  name_id: string
}

let searchIndex: SearchResult[] | null = null

function buildSearchIndex(): SearchResult[] {
  if (searchIndex) return searchIndex
  const seen = new Set<string>()
  searchIndex = []
  for (const key of Object.keys(steamData)) {
    const item = steamData[key as keyof typeof steamData]
    if (item.en_name && !seen.has(item.en_name)) {
      seen.add(item.en_name)
      searchIndex.push({ en_name: item.en_name, name_id: String(item.name_id) })
    }
  }
  return searchIndex
}

export function searchItems(query: string, limit = 10): SearchResult[] {
  if (!query.trim()) return []
  const lower = query.toLowerCase()
  const index = buildSearchIndex()
  return index
    .filter((item) => item.en_name.toLowerCase().includes(lower))
    .slice(0, limit)
}

export function findItemByName(enName: string): SearchResult | null {
  const index = buildSearchIndex()
  return index.find((item) => item.en_name === enName) ?? null
}
