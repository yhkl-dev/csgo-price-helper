import { sendToBackground } from "@plasmohq/messaging"

import igxeData from "~SteamTradingSite-ID-Mapper/igxe/730.json"
import uuData from "~SteamTradingSite-ID-Mapper/uuyp/730.json"

import {
  getBUFFGoodsInfo,
  getBUFFwantToBuyPrice,
  getC5BatchPrice,
  getC5MaxBuyPrice,
  getIgxeBuyPrice,
  getIgxeLeasePrice,
  getIgxeSellPrice,
  getSteamGoodsInfo,
  getUUPriceInfo,
  getUURentPriceInfo,
  getUUwantToBuyPrice,
  getUUYPuserInfo,
  searchForExactNameId
} from "./goods"
import { CNY_PLATFORMS, createDataType } from "./helpers"
import type { DataType, GoodsInfo } from "./types"

const PLATFORM_COOKIES_URLS = {
  BUFF: "https://buff.163.com",
  UUYP: "https://www.youpin898.com/"
} as const

const UUYP_TOKEN_NAMES = [
  "uu_token",
  "token",
  "access_token",
  "auth_token",
  "jwt",
  "authorization"
]

export const fetchCookies = async (
  url: string
): Promise<chrome.cookies.Cookie[]> => {
  const cookies = await sendToBackground({
    name: "get-cookies",
    body: { url }
  })
  return cookies as chrome.cookies.Cookie[]
}

export const fetchBuffData = async (buffGoodsId: string) => {
  const cookies = await fetchCookies(PLATFORM_COOKIES_URLS.BUFF)
  const [goodsResponse, wantToBuyPrice] = await Promise.all([
    getBUFFGoodsInfo(buffGoodsId, cookies),
    getBUFFwantToBuyPrice(buffGoodsId, cookies)
  ])

  if (!goodsResponse?.data?.items?.[0]?.price) {
    throw new Error("Failed to fetch BUFF goods data")
  }

  return {
    goodsInfo: goodsResponse.data.goods_infos[buffGoodsId] as GoodsInfo,
    sellPrice: goodsResponse.data.items[0].price as string,
    wantToBuyPrice
  }
}

export const fetchUUYPData = async (hashName: string): Promise<DataType> => {
  try {
    const cookies = await fetchCookies(PLATFORM_COOKIES_URLS.UUYP)
    const token = cookies.find((cookie) =>
      UUYP_TOKEN_NAMES.includes(cookie.name)
    )

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

export const fetchSteamData = async (hashName: string): Promise<DataType> => {
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
  } catch {
    return createDataType(
      "Steam",
      "",
      hashName,
      chrome.i18n.getMessage("networkError"),
      "/"
    )
  }
}

export const fetchC5Data = async (
  hashName: string,
  apiKey: string
): Promise<DataType> => {
  if (!apiKey) {
    return createDataType(
      "C5",
      "",
      hashName,
      chrome.i18n.getMessage("c5NeedApiKey"),
      "/"
    )
  }

  try {
    const response = await getC5BatchPrice(apiKey, [hashName])
    if (!response.success) {
      throw new Error(`C5 API error: ${response.errorCode}`)
    }

    const item = response.data[hashName]
    if (!item || item.price === undefined) {
      return createDataType(
        "C5",
        "",
        hashName,
        chrome.i18n.getMessage("notFound"),
        "/"
      )
    }

    const sellPrice = String(item.price)

    let buyPrice = "/"
    try {
      buyPrice = await getC5MaxBuyPrice(apiKey, item.itemId)
    } catch {
      // C5 buy price is optional — fall back to "/"
    }

    return createDataType("C5", item.itemId, hashName, sellPrice, buyPrice)
  } catch {
    return createDataType(
      "C5",
      "",
      hashName,
      chrome.i18n.getMessage("dataError"),
      "/"
    )
  }
}

export const fetchIgxeData = async (hashName: string): Promise<DataType> => {
  const productId = igxeData[hashName]
  if (!productId) {
    return createDataType(
      "IGXE",
      "",
      hashName,
      chrome.i18n.getMessage("notFound"),
      "/"
    )
  }
  try {
    const [sellPrice, buyPrice, rentPrice] = await Promise.all([
      getIgxeSellPrice(String(productId)),
      getIgxeBuyPrice(String(productId)),
      getIgxeLeasePrice(String(productId))
    ])
    return createDataType(
      "IGXE",
      String(productId),
      hashName,
      sellPrice || chrome.i18n.getMessage("notAvailable"),
      buyPrice || "/",
      rentPrice
    )
  } catch {
    return createDataType(
      "IGXE",
      "",
      hashName,
      chrome.i18n.getMessage("dataError"),
      "/"
    )
  }
}
