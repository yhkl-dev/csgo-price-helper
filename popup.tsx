import { useEffect, useMemo, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import {
  getBUFFGoodsInfo,
  getBUFFwantToBuyPrice,
  getC5GoodsInfo,
  getSteamGoodsInfo,
  getUUPriceInfo,
  getUURentPriceInfo,
  getUUwantToBuyPrice,
  getUUYPuserInfo,
  searchForExactNameId
} from "~utils/goods"
import {
  CNY_PLATFORMS,
  constructGoodsURL,
  createDataType,
  formatPrice,
  isClickable,
  parsePrice,
  PLATFORM_URLS
} from "~utils/helpers"
import type { DataType, GoodsInfo } from "~utils/types"

import c5Data from "./SteamTradingSite-ID-Mapper/c5/730.json"
import uuData from "./SteamTradingSite-ID-Mapper/uuyp/730.json"

import "./style.css"

const PLATFORM_COLORS: Record<string, string> = {
  BUFF: "bg-orange-500",
  UUYP: "bg-purple-500",
  Steam: "bg-blue-500",
  C5: "bg-green-500"
}

const PLATFORM_COOKIES_URLS = {
  BUFF: "https://buff.163.com",
  UUYP: "https://www.youpin898.com/"
} as const

const TABLE_COLUMNS = [
  { title: chrome.i18n.getMessage("platform"), key: "Platform" },
  { title: chrome.i18n.getMessage("sell"), key: "Sell" },
  { title: chrome.i18n.getMessage("rent"), key: "Rent" },
  { title: chrome.i18n.getMessage("wantToBuy"), key: "WantToBuy" }
] as const

// ==================== Data Fetching ====================

const fetchCookies = async (url: string): Promise<chrome.cookies.Cookie[]> => {
  const cookies = await sendToBackground({
    name: "get-cookies",
    body: { url }
  })
  return cookies as chrome.cookies.Cookie[]
}

const fetchBuffData = async (buffGoodsId: string) => {
  const cookies = await fetchCookies(PLATFORM_COOKIES_URLS.BUFF)
  const [goodsResponse, wantToBuyPrice] = await Promise.all([
    getBUFFGoodsInfo(buffGoodsId, cookies),
    getBUFFwantToBuyPrice(buffGoodsId, cookies)
  ])

  if (!goodsResponse?.data?.items?.[0]?.price) {
    throw new Error("Failed to fetch BUFF goods data")
  }

  return {
    goodsInfo: goodsResponse.data.goods_infos[buffGoodsId],
    sellPrice: goodsResponse.data.items[0].price,
    wantToBuyPrice
  }
}

const fetchUUYPData = async (hashName: string): Promise<DataType> => {
  try {
    const cookies = await fetchCookies(PLATFORM_COOKIES_URLS.UUYP)

    const TOKEN_NAMES = [
      "uu_token",
      "token",
      "access_token",
      "auth_token",
      "jwt",
      "authorization"
    ]
    const token = cookies.find((cookie) => TOKEN_NAMES.includes(cookie.name))

    if (!token) {
      return createDataType(
        "UUYP",
        "",
        hashName,
        chrome.i18n.getMessage("notLoggedIn"),
        ""
      )
    }

    const stored = await chrome.storage.local.get("uuypDevice")
    const storedDevice = (stored?.uuypDevice as Record<string, string>) || {}
    const device = {
      deviceId: storedDevice.deviceId || "",
      deviceUk: storedDevice.deviceUk || "",
      uk: storedDevice.uk || ""
    }

    const goodsId = uuData[hashName]
    if (!goodsId) {
      return createDataType(
        "UUYP",
        "",
        hashName,
        chrome.i18n.getMessage("notFound"),
        ""
      )
    }

    const userId = await getUUYPuserInfo(token)

    const [sellPrice, rentPrice, wantToBuyPrice] = await Promise.all([
      getUUPriceInfo(token, userId, goodsId, device),
      getUURentPriceInfo(token, userId, goodsId, device),
      getUUwantToBuyPrice(token, goodsId, device)
    ])

    return createDataType(
      "UUYP",
      goodsId,
      hashName,
      sellPrice || chrome.i18n.getMessage("notAvailable"),
      String(wantToBuyPrice || chrome.i18n.getMessage("notAvailable")),
      {
        LeaseUnitPrice: rentPrice?.LeaseUnitPrice || "",
        LongLeaseUnitPrice: rentPrice?.LongLeaseUnitPrice || ""
      }
    )
  } catch (err) {
    if (err instanceof Error && err.message === "UUYP_NOT_LOGIN") {
      return createDataType(
        "UUYP",
        "",
        hashName,
        chrome.i18n.getMessage("notLoggedIn"),
        ""
      )
    }
    return createDataType(
      "UUYP",
      "",
      hashName,
      chrome.i18n.getMessage("networkError"),
      ""
    )
  }
}

const fetchSteamData = async (hashName: string): Promise<DataType> => {
  const nameId = searchForExactNameId(hashName)
  try {
    if (!nameId) {
      return createDataType(
        "Steam",
        "",
        hashName,
        chrome.i18n.getMessage("notFound"),
        "/"
      )
    }
    const res = await getSteamGoodsInfo(nameId)
    const prefix = res.price_prefix || ""
    const sellPrice =
      prefix +
      (res.sell_order_price?.split(" ")?.[1] ||
        chrome.i18n.getMessage("notAvailable"))
    const buyPrice =
      prefix +
      (res.buy_order_price?.split(" ")?.[1] ||
        chrome.i18n.getMessage("notAvailable"))
    return createDataType("Steam", nameId, hashName, sellPrice, buyPrice)
  } catch (error) {
    return createDataType(
      "Steam",
      "",
      hashName,
      chrome.i18n.getMessage("networkError"),
      "/"
    )
  }
}

const fetchC5Data = async (hashName: string): Promise<DataType> => {
  try {
    const goodsId = c5Data[hashName]
    console.log("[C5] hashName:", hashName, "→ goodsId:", goodsId)
    if (!goodsId) {
      console.warn("[C5] goodsId not found for hashName:", hashName)
      return createDataType(
        "C5",
        "",
        hashName,
        chrome.i18n.getMessage("notFound"),
        "/"
      )
    }
    const price = await getC5GoodsInfo(goodsId)
    console.log("[C5] price result:", price)
    return createDataType(
      "C5",
      goodsId,
      hashName,
      price || chrome.i18n.getMessage("notAvailable"),
      "/"
    )
  } catch (error) {
    console.error("[C5] fetchC5Data error:", error)
    return createDataType(
      "C5",
      "",
      hashName,
      chrome.i18n.getMessage("dataError"),
      "/"
    )
  }
}

// ==================== Sub-Components ====================

const Skeleton = () => (
  <div className="flex-1 px-4 py-2 space-y-0">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex items-center gap-6 py-3 border-b border-border/50 last:border-0">
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
    style={{ width: 480, height: 360 }}>
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

// ==================== Main Component ====================

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false)
  const [isBuffPage, setIsBuffPage] = useState<boolean>(false)
  const [tableData, setTableData] = useState<DataType[]>([])
  const [goodsInfo, setGoodsInfo] = useState<Partial<GoodsInfo>>({})
  const [lang, setLang] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const loadData = async () => {
    const pageInfo = await sendToBackground({ name: "get-page-info" })
    setIsBuffPage(pageInfo.isBuffPage)

    if (!pageInfo.isBuffPage) return

    setLoading(true)
    setError("")
    try {
      const buffData = await fetchBuffData(pageInfo.buffGoodsId)
      setGoodsInfo(buffData.goodsInfo)

      const hashName = buffData.goodsInfo.market_hash_name
      const allPlatformData = await Promise.all([
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
        fetchC5Data(hashName)
      ])
      setTableData(allPlatformData)
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

  useEffect(() => {
    loadLanguage()
    loadData()
  }, [])

  const priceStats = useMemo(() => {
    const sellPrices = tableData
      .map((d) => ({ platform: d.Platform, price: parsePrice(d.Sell) }))
      .filter((p) => p.price !== null)
    if (sellPrices.length < 2) return { min: null, max: null }
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

  if (!isBuffPage) {
    return <WrongPageState />
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-background"
      style={{ width: 480, height: 360 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
        <img
          src={goodsInfo.icon_url}
          alt={goodsInfo.name}
          className="w-7 h-7 rounded-sm flex-shrink-0"
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
                      className="px-4 py-2.5 text-left text-xs font-normal text-muted-foreground">
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
                      className={`border-b border-border/50 last:border-0 transition-colors ${
                        clickable
                          ? "cursor-pointer hover:bg-muted group"
                          : "cursor-default"
                      }`}>
                      <td className="px-4 py-3">
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
                      <td
                        className={`px-4 py-3 text-sm tabular-nums ${getSellPriceClass(data.Platform, data.Sell)}`}>
                        {data.Sell === chrome.i18n.getMessage("notLoggedIn") ? (
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
                      <td className="px-4 py-3 text-sm text-muted-foreground">
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
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-foreground">
                        {data.WantToBuy ? (
                          formatPrice(data.WantToBuy, data.Platform)
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
