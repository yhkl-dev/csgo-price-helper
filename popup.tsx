import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useEffect, useState } from "react"

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
import type { DataType, GoodsInfo } from "~utils/types"

import c5Data from "./c5/string_730.json"
import uuData from "./uuyp/730.json"

import "./style.css"

const PLATFORM_URLS = {
  Steam: (hashName: string) =>
    `https://steamcommunity.com/market/listings/730/${hashName}`,
  BUFF: (goodsId: string) => `https://buff.163.com/goods/${goodsId}`,
  UUYP: (goodsId: string) => `https://www.youpin898.com/goodInfo?id=${goodsId}`,
  C5: (goodsId: string) => `https://www.c5game.com/csgo/${goodsId}`
} as const

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

const constructGoodsURL = (
  platform: string,
  goodsID: string,
  hashName: string
): string => {
  const urlBuilder = PLATFORM_URLS[platform]
  if (!urlBuilder) return ""
  return platform === "Steam" ? urlBuilder(hashName) : urlBuilder(goodsID)
}

const createDataType = (
  platform: string,
  goodsId: string,
  hashName: string,
  sellPrice: string,
  wantToBuyPrice: string,
  rentPrice: { LeaseUnitPrice: string; LongLeaseUnitPrice: string } = {
    LeaseUnitPrice: "",
    LongLeaseUnitPrice: ""
  }
): DataType => ({
  Platform: platform,
  GoodsID: goodsId,
  MarkingHashName: hashName,
  Sell: sellPrice,
  Rent: rentPrice,
  WantToBuy: wantToBuyPrice
})

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
    const token = cookies.find((cookie) => cookie.name === "token")

    if (!token) {
      return createDataType(
        "UUYP",
        "",
        hashName,
        chrome.i18n.getMessage("notLoggedIn"),
        ""
      )
    }

    const goodsId = uuData[hashName]
    if (!goodsId) {
      return createDataType("UUYP", "", hashName, "Not Found", "")
    }

    const userId = await getUUYPuserInfo(token)

    const [sellPrice, rentPrice, wantToBuyPrice] = await Promise.all([
      getUUPriceInfo(token, userId, goodsId),
      getUURentPriceInfo(token, userId, goodsId),
      getUUwantToBuyPrice(token, goodsId)
    ])

    return createDataType(
      "UUYP",
      goodsId,
      hashName,
      sellPrice || "N/A",
      wantToBuyPrice || "N/A",
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
      return createDataType("Steam", "", hashName, "Not Found", "/")
    }
    const res = await getSteamGoodsInfo(nameId)
    const sellPrice = res.sell_order_price?.split(" ")?.[1] || "N/A"
    const buyPrice = res.buy_order_price?.split(" ")?.[1] || "N/A"
    return createDataType("Steam", nameId, hashName, sellPrice, buyPrice)
  } catch (error) {
    return createDataType("Steam", "", hashName, "network error", "/")
  }
}

const fetchC5Data = async (hashName: string): Promise<DataType> => {
  try {
    const goodsId = c5Data[hashName]
    if (!goodsId) {
      return createDataType("C5", "", hashName, "Not Found", "/")
    }
    const price = await getC5GoodsInfo(goodsId)
    return createDataType("C5", goodsId, hashName, price || "N/A", "/")
  } catch (error) {
    return createDataType("C5", "", hashName, "Error", "/")
  }
}

// ==================== 主组件 ====================
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
      setError(err instanceof Error ? err.message : "Failed to load data")
      console.error("Error loading data:", err)
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

  if (!isBuffPage) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 gap-6 px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Wrong Page</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            This extension only works on BUFF marketplace. Please navigate to
            BUFF to use it.
          </p>
        </div>
        <a
          href="https://buff.163.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
          <span>🔗</span>
          Open BUFF Marketplace
        </a>
        <p className="text-xs text-gray-500 mt-2">
          You can also search for BUFF in your browser
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-auto">
      <div className="flex space-x-3 items-center mb-3 sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
        <img
          src={goodsInfo.icon_url}
          alt={goodsInfo.name}
          className="w-12 h-12 rounded-lg shadow-md flex-shrink-0"
        />
        <h3 className="text-base font-bold text-gray-800 truncate">
          {lang.includes("zh") ? goodsInfo.name : goodsInfo.market_hash_name}
        </h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="text-3xl">⚠️</div>
          <p className="text-red-600 font-semibold text-center">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200">
            Retry
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 py-3">
          <div className="w-full overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  {TABLE_COLUMNS.map((column, key) => (
                    <TableHead
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-tight">
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((data, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-3">
                      <a
                        href={constructGoodsURL(
                          data.Platform,
                          data.GoodsID,
                          data.MarkingHashName
                        )}
                        className="text-blue-600 hover:text-blue-700 font-medium">
                        {data.Platform}
                      </a>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-gray-900">
                      {data.Sell}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600">
                      {data.Rent.LeaseUnitPrice ? (
                        <div className="space-y-1 text-xs">
                          <div>
                            {chrome.i18n.getMessage("longTerm")}:{" "}
                            {data.Rent.LeaseUnitPrice}
                          </div>
                          <div>
                            {chrome.i18n.getMessage("shortTerm")}:{" "}
                            {data.Rent.LongLeaseUnitPrice}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-gray-900">
                      {data.WantToBuy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
