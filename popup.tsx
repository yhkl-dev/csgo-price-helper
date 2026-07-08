import { useEffect, useMemo, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { useC5ApiKey } from "~hooks/useC5ApiKey"
import { getCachedPrices, setCachedPrices } from "~utils/cache"
import {
  fetchBuffData,
  fetchC5Data,
  fetchIgxeData,
  fetchSteamData,
  fetchUUYPData
} from "~utils/fetch-data"
import {
  constructGoodsURL,
  createDataType,
  formatPrice,
  isClickable,
  parsePrice
} from "~utils/helpers"
import { searchItems } from "~utils/search"
import type { DataType, GoodsInfo } from "~utils/types"

import "./style.css"

const PLATFORM_COLORS: Record<string, string> = {
  BUFF: "bg-orange-500",
  UUYP: "bg-purple-500",
  Steam: "bg-blue-500",
  C5: "bg-green-500",
  IGXE: "bg-cyan-500"
}

const TABLE_COLUMNS = [
  { title: chrome.i18n.getMessage("platform"), key: "Platform" },
  { title: chrome.i18n.getMessage("sell"), key: "Sell" },
  { title: chrome.i18n.getMessage("wantToBuy"), key: "WantToBuy" },
  { title: chrome.i18n.getMessage("rent"), key: "Rent" }
] as const

// ==================== Sub-Components ====================

const Skeleton = () => (
  <div className="flex-1 px-4 py-2 space-y-0">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="flex items-center gap-6 h-12 border-b border-border/50 last:border-0">
        <div className="w-14 h-3.5 bg-muted rounded-sm animate-pulse" />
        <div className="w-16 h-3.5 bg-muted rounded-sm animate-pulse" />
        <div className="w-20 h-3.5 bg-muted rounded-sm animate-pulse" />
        <div className="w-12 h-3.5 bg-muted rounded-sm animate-pulse" />
      </div>
    ))}
  </div>
)

const ErrorState = ({
  message,
  onRetry
}: {
  message: string
  onRetry: () => void
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <p className="text-sm text-muted-foreground">{message}</p>
    <button
      onClick={onRetry}
      className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
      {chrome.i18n.getMessage("retry")}
    </button>
  </div>
)

const WrongPageState = () => (
  <div
    className="flex flex-col items-center justify-center gap-4 bg-background px-6"
    style={{ width: 480, height: 420 }}>
    <p className="text-sm text-muted-foreground text-center leading-relaxed">
      {chrome.i18n.getMessage("wrongPageMessage")}
    </p>
    <a
      href="https://buff.163.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
      {chrome.i18n.getMessage("openBuffMarketplace")}
    </a>
  </div>
)

const SearchPage = ({ onSelect }: { onSelect: (hashName: string) => void }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{ en_name: string }[]>([])

  const handleInput = (value: string) => {
    setQuery(value)
    setResults(value.trim() ? searchItems(value) : [])
  }

  return (
    <div
      className="flex flex-col bg-background"
      style={{ width: 480, height: 420 }}>
      <div className="px-4 py-3 border-b border-border">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={chrome.i18n.getMessage("searchPlaceholder")}
          autoFocus
          className="w-full h-9 px-3 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
        />
      </div>
      <div className="flex-1 overflow-auto">
        {results.map((item) => (
          <button
            key={item.en_name}
            onClick={() => onSelect(item.en_name)}
            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted border-b border-border/50 last:border-0 transition-colors">
            {item.en_name}
          </button>
        ))}
        {query.trim() && results.length === 0 && (
          <p className="px-4 py-8 text-sm text-muted-foreground text-center">
            {chrome.i18n.getMessage("noResults")}
          </p>
        )}
        {!query.trim() && (
          <p className="px-4 py-8 text-sm text-muted-foreground text-center">
            {chrome.i18n.getMessage("searchHint")}
          </p>
        )}
      </div>
    </div>
  )
}

// ==================== Main Component ====================

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false)
  const [isBuffPage, setIsBuffPage] = useState<boolean>(false)
  const [tableData, setTableData] = useState<DataType[]>([])
  const [goodsInfo, setGoodsInfo] = useState<Partial<GoodsInfo>>({})
  const [lang, setLang] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [initialized, setInitialized] = useState<boolean>(false)
  const [searchMode, setSearchMode] = useState<boolean>(false)

  const onKeyReady = (key: string) => {
    if (!initialized) {
      setInitialized(true)
      loadData(key)
    }
  }

  const fetchAndCache = async (
    hashName: string,
    fetcher: () => Promise<DataType[]>,
    sortOrder: Record<string, number>
  ): Promise<DataType[]> => {
    const cached = await getCachedPrices(hashName)
    if (cached) return cached

    const allPlatformData = await fetcher()
    const sorted = allPlatformData.sort((a, b) => {
      return (sortOrder[a.Platform] ?? 99) - (sortOrder[b.Platform] ?? 99)
    })
    await setCachedPrices(hashName, sorted)
    return sorted
  }

  const loadData = async (c5Key?: string) => {
    setSearchMode(false)
    const pageInfo = await sendToBackground({ name: "get-page-info" })
    if (!pageInfo) {
      setError(chrome.i18n.getMessage("loadFailed"))
      return
    }
    setIsBuffPage(pageInfo.isBuffPage)

    if (!pageInfo.isBuffPage) return

    const apiKey = c5Key ?? c5ApiKey

    setLoading(true)
    setError("")
    try {
      const buffData = await fetchBuffData(pageInfo.buffGoodsId)
      setGoodsInfo(buffData.goodsInfo)

      const hashName = buffData.goodsInfo.market_hash_name

      const sorted = await fetchAndCache(
        hashName,
        () =>
          Promise.all([
            Promise.resolve(
              createDataType(
                "BUFF",
                pageInfo.buffGoodsId,
                hashName,
                buffData.sellPrice,
                buffData.wantToBuyPrice
              )
            ),
            fetchUUYPData(hashName),
            fetchSteamData(hashName),
            fetchC5Data(hashName, apiKey),
            fetchIgxeData(hashName)
          ]),
        { Steam: 0, BUFF: 1 }
      )
      setTableData(sorted)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : chrome.i18n.getMessage("loadFailed")
      )
    } finally {
      setLoading(false)
    }
  }

  const loadDataByHashName = async (hashName: string) => {
    const apiKey = c5ApiKey

    setLoading(true)
    setError("")
    setSearchMode(true)

    try {
      const sorted = await fetchAndCache(
        hashName,
        () =>
          Promise.all([
            fetchUUYPData(hashName),
            fetchSteamData(hashName),
            fetchC5Data(hashName, apiKey),
            fetchIgxeData(hashName)
          ]),
        { Steam: 0 }
      )
      setTableData(sorted)
      setGoodsInfo({ market_hash_name: hashName, name: hashName })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : chrome.i18n.getMessage("loadFailed")
      )
    } finally {
      setLoading(false)
    }
  }

  const loadLanguage = async () => {
    const languages = await chrome.i18n.getAcceptLanguages()
    setLang(languages)
  }

  const {
    c5ApiKey,
    c5KeyInput,
    c5Editing,
    setC5KeyInput,
    setC5Editing,
    saveC5ApiKey,
    initC5ApiKey
  } = useC5ApiKey(onKeyReady)

  useEffect(() => {
    loadLanguage()
    initC5ApiKey()
  }, [])

  const priceStats = useMemo(() => {
    const sellPrices = tableData
      .map((d) => ({ platform: d.Platform, price: parsePrice(d.Sell) }))
      .filter((p) => p.price !== null)
    if (sellPrices.length < 2) return { minPlatform: null, maxPlatform: null }
    const prices = sellPrices.map((p) => p.price!)
    return {
      minPlatform: sellPrices.find((p) => p.price === Math.min(...prices))!
        .platform,
      maxPlatform: sellPrices.find((p) => p.price === Math.max(...prices))!
        .platform
    }
  }, [tableData])

  const getSellPriceClass = (platform: string, price: string): string => {
    const num = parsePrice(price)
    if (num === null || !priceStats.minPlatform) return "text-foreground"
    const allSame = priceStats.minPlatform === priceStats.maxPlatform
    if (allSame) return "text-foreground"
    if (platform === priceStats.minPlatform)
      return "text-[hsl(var(--price-low))] font-semibold"
    if (platform === priceStats.maxPlatform)
      return "text-[hsl(var(--price-high))]"
    return "text-foreground"
  }

  const handleRowClick = (data: DataType) => {
    if (!isClickable(data)) return
    const url = constructGoodsURL(
      data.Platform,
      data.GoodsID,
      data.MarkingHashName
    )
    if (url) window.open(url, "_blank")
  }

  if (!isBuffPage && !searchMode && tableData.length === 0 && !loading) {
    return <SearchPage onSelect={loadDataByHashName} />
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-background"
      style={{ width: 480, height: 420 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border shrink-0">
        <img
          src={goodsInfo.icon_url}
          alt={goodsInfo.name || ""}
          className="w-7 h-7 rounded-sm flex-shrink-0"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = "none"
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {lang.includes("zh") ? goodsInfo.name : goodsInfo.market_hash_name}
          </h3>
          <p className="text-[10px] text-muted-foreground/50 truncate">
            {chrome.i18n.getMessage("currencyNote")}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-2 text-left text-xs font-normal text-muted-foreground">
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((data) => {
                  const clickable = isClickable(data)
                  return (
                    <tr
                      key={data.Platform}
                      onClick={() => handleRowClick(data)}
                      className={`h-12 border-b border-border/50 last:border-0 transition-colors ${
                        clickable
                          ? "cursor-pointer hover:bg-muted group"
                          : "cursor-default"
                      }`}>
                      {TABLE_COLUMNS.map((column) => {
                        switch (column.key) {
                          case "Platform":
                            return (
                              <td key={column.key} className="px-4 py-2">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PLATFORM_COLORS[data.Platform] || "bg-gray-400"}`}
                                  />
                                  <span className="text-sm font-medium text-foreground">
                                    {data.Platform}
                                  </span>
                                  {clickable && (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground text-xs ml-auto">
                                      →
                                    </span>
                                  )}
                                </div>
                              </td>
                            )
                          case "Sell":
                            return (
                              <td
                                key={column.key}
                                className={`px-4 py-2 text-sm tabular-nums ${getSellPriceClass(data.Platform, data.Sell)}`}>
                                {data.Sell ===
                                chrome.i18n.getMessage("notLoggedIn") ? (
                                  <a
                                    href="https://www.youpin898.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2 hover:text-foreground transition-colors">
                                    {data.Sell}
                                  </a>
                                ) : (
                                  formatPrice(data.Sell, data.Platform)
                                )}
                              </td>
                            )
                          case "WantToBuy":
                            return (
                              <td
                                key={column.key}
                                className="px-4 py-2 text-sm tabular-nums text-foreground">
                                {data.WantToBuy ? (
                                  formatPrice(data.WantToBuy, data.Platform)
                                ) : (
                                  <span className="text-muted-foreground/40">
                                    —
                                  </span>
                                )}
                              </td>
                            )
                          case "Rent":
                            return (
                              <td
                                key={column.key}
                                className="px-4 py-2 text-sm text-muted-foreground align-middle">
                                {data.Rent.LeaseUnitPrice ? (
                                  <div className="space-y-1 text-xs">
                                    <div>
                                      {chrome.i18n.getMessage("shortTerm")}:{" "}
                                      <span className="tabular-nums">
                                        {formatPrice(
                                          data.Rent.LeaseUnitPrice,
                                          data.Platform
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      {chrome.i18n.getMessage("longTerm")}:{" "}
                                      <span className="tabular-nums">
                                        {formatPrice(
                                          data.Rent.LongLeaseUnitPrice,
                                          data.Platform
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40">
                                    —
                                  </span>
                                )}
                              </td>
                            )
                          default:
                            return null
                        }
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* C5 API Settings */}
          <div className="px-4 py-1.5 border-t border-border shrink-0 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground shrink-0">
              C5
            </span>
            {c5Editing ? (
              <>
                <input
                  type="text"
                  value={c5KeyInput}
                  onChange={(e) => setC5KeyInput(e.target.value)}
                  placeholder="app-key"
                  className="flex-1 h-6 px-2 text-[10px] border border-border rounded bg-background text-foreground focus:outline-none focus:border-foreground/30"
                />
                <a
                  href="https://www.c5game.com/user/user/open-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title={chrome.i18n.getMessage("c5ApiHelp")}>
                  ?
                </a>
                <button
                  onClick={() => {
                    saveC5ApiKey(c5KeyInput)
                    setC5Editing(false)
                    loadData(c5KeyInput)
                  }}
                  className="h-6 px-2 text-[10px] bg-foreground text-background rounded hover:opacity-80 transition-opacity shrink-0">
                  {chrome.i18n.getMessage("save")}
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-[10px] text-muted-foreground truncate">
                  {c5ApiKey
                    ? "•".repeat(16)
                    : chrome.i18n.getMessage("c5NotSet")}
                </span>
                {!c5ApiKey && (
                  <a
                    href="https://www.c5game.com/user/user/open-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    {chrome.i18n.getMessage("c5GetKey")} →
                  </a>
                )}
                <button
                  onClick={() => setC5Editing(true)}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  {c5ApiKey
                    ? chrome.i18n.getMessage("edit")
                    : chrome.i18n.getMessage("set")}
                </button>
              </>
            )}
          </div>
          <div className="px-4 py-1.5 border-t border-border/50 shrink-0 flex items-center justify-between">
            <a
              href="https://github.com/yhkl-dev/csgo-price-helper/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {chrome.i18n.getMessage("feedback")}
            </a>
            <span className="text-[10px] text-muted-foreground/50">
              Built by yhkl &copy; 2026
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default IndexPopup
